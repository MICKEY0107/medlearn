import { resolvePubMed } from './pubmed'
import { resolveSemanticScholar } from './semanticScholar'
import { resolveCrossRef, extractDOI } from './crossref'
import { resolvePDF } from './pdfParser'
import { PaperMetadata } from './pubmed'

export type IngestionInput =
  | { type: 'url'; url: string }
  | { type: 'pdf'; buffer: Buffer }
  | { type: 'manual'; title: string; abstract: string; authors?: string[] }

export async function ingestPaper(input: IngestionInput): Promise<PaperMetadata> {
  if (input.type === 'pdf') {
    return resolvePDF(input.buffer)
  }

  if (input.type === 'manual') {
    return {
      title: input.title,
      authors: input.authors || [],
      abstract: input.abstract,
      year: null,
      journal: null,
      doi: null,
      openAccessUrl: null,
      source: 'manual',
    }
  }

  const url = input.url.trim()

  if (url.includes('pubmed.ncbi.nlm.nih.gov') || /^\d{7,8}$/.test(url)) {
    return resolvePubMed(url)
  }

  if (url.includes('semanticscholar.org')) {
    return resolveSemanticScholar(url)
  }

  const doi = extractDOI(url)
  if (doi) {
    return resolveCrossRef(doi)
  }

  if (url.includes('researchgate.net') || url.includes('scholar.google.com')) {
    const doiFromPage = await extractDOIFromPage(url)
    if (doiFromPage) return resolveCrossRef(doiFromPage)
  }

  throw new Error('Could not resolve paper from this URL. Please try a PubMed, Semantic Scholar, or DOI link, or paste the abstract manually.')
}

async function extractDOIFromPage(url: string): Promise<string | null> {
  try {
    const axios = (await import('axios')).default
    const response = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    return extractDOI(response.data)
  } catch {
    return null
  }
}
