import axios from 'axios'
import { PaperMetadata } from './pubmed'

export async function resolveSemanticScholar(input: string): Promise<PaperMetadata> {
  const paperId = extractS2Id(input)
  if (!paperId) throw new Error('Could not extract Semantic Scholar paper ID')

  const fields = 'title,authors,abstract,year,publicationDate,openAccessPdf,externalIds,venue'
  const url = `https://api.semanticscholar.org/graph/v1/paper/${paperId}`

  const headers: Record<string, string> = {}
  if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
    headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY
  }

  const response = await axios.get(url, {
    params: { fields },
    headers,
    timeout: 10000,
  })

  const data = response.data

  return {
    title: data.title || 'Unknown Title',
    authors: (data.authors || []).map((a: { name: string }) => a.name),
    abstract: data.abstract || '',
    year: data.year || null,
    journal: data.venue || null,
    doi: data.externalIds?.DOI || null,
    openAccessUrl: data.openAccessPdf?.url || null,
    source: 'semantic_scholar',
  }
}

function extractS2Id(input: string): string | null {
  const urlMatch = input.match(/semanticscholar\.org\/paper\/[^/]*\/([A-Za-z0-9]+)/i)
  if (urlMatch) return urlMatch[1]

  const hashMatch = input.match(/semanticscholar\.org\/paper\/([a-f0-9]{40})/i)
  if (hashMatch) return hashMatch[1]

  if (/^[A-Za-z0-9]{40}$/.test(input.trim())) return input.trim()

  return null
}
