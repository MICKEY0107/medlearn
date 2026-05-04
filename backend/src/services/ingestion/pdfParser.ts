const pdfParse = require('pdf-parse')
import { generateRemoteJSON } from '../../lib/remoteAI'
import { PaperMetadata } from './pubmed'

interface PDFExtractionResult {
  title: string
  authors: string[]
  abstract: string
  year: number | null
  journal: string | null
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line: string) => cleanText(line))
    .filter(Boolean)
}

function inferTitle(lines: string[]): string {
  return lines.find((line) => line.length > 20 && line.length < 220) || 'Unknown Title'
}

function inferYear(text: string): number | null {
  const matches = text.match(/\b(19|20)\d{2}\b/g)
  if (!matches?.length) return null
  const year = Number(matches[0])
  return Number.isFinite(year) ? year : null
}

function inferAbstract(text: string): string {
  const abstractMatch = text.match(/abstract\s*[:\-]?\s*([\s\S]{120,2500}?)(?:\n\s*keywords\b|\n\s*introduction\b|\n\s*background\b|\n\s*methods\b)/i)
  if (abstractMatch?.[1]) return cleanText(abstractMatch[1])

  const sentences = cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 8)
  return cleanText(sentences.join(' '))
}

function inferAuthors(lines: string[], title: string): string[] {
  const titleIndex = lines.findIndex((line) => line === title)
  const nearby = lines.slice(Math.max(0, titleIndex + 1), Math.max(0, titleIndex + 4))
  const authorLine = nearby.find((line) => /,| and |;/.test(line) && !/abstract|journal|doi|http|www\./i.test(line))
  if (!authorLine) return []

  return authorLine
    .split(/,| and |;/)
    .map((part) => cleanText(part.replace(/\b(MD|MBBS|PhD|MS|MSc|BSc|Dr\.?|Prof\.?)\b/gi, '')))
    .filter((name) => name.length >= 3 && name.length <= 60)
    .slice(0, 10)
}

function heuristicPDFMetadata(text: string): PaperMetadata {
  const lines = splitLines(text)
  const title = inferTitle(lines)
  const abstract = inferAbstract(text)
  const authors = inferAuthors(lines, title)

  return {
    title,
    authors,
    abstract,
    year: inferYear(text),
    journal: null,
    doi: null,
    openAccessUrl: null,
    source: 'pdf',
  }
}

export async function resolvePDF(buffer: Buffer): Promise<PaperMetadata> {
  const data = await pdfParse(buffer)
  const text = data.text.substring(0, 7000)

  const parsed = await generateRemoteJSON<PDFExtractionResult>(`Extract metadata from this academic paper text. Return ONLY valid JSON, no other text, no markdown:

{
  "title": "string",
  "authors": ["string"],
  "abstract": "string (the full abstract text)",
  "year": number or null,
  "journal": "string or null"
}

Paper text:
${text}`, 1024)

  if (parsed && typeof parsed.title === 'string' && Array.isArray(parsed.authors) && typeof parsed.abstract === 'string') {
    return {
      title: parsed.title,
      authors: parsed.authors.map((author) => cleanText(String(author))).filter(Boolean),
      abstract: cleanText(parsed.abstract),
      year: typeof parsed.year === 'number' ? parsed.year : null,
      journal: typeof parsed.journal === 'string' && parsed.journal.trim() ? parsed.journal.trim() : null,
      doi: null,
      openAccessUrl: null,
      source: 'pdf',
    }
  }

  return heuristicPDFMetadata(text)
}
