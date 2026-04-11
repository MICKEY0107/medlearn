import axios from 'axios'
import * as cheerio from 'cheerio'
import { PaperMetadata } from './pubmed'

export async function resolveCrossRef(doi: string): Promise<PaperMetadata> {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`

  const response = await axios.get(url, {
    headers: { 'User-Agent': 'MedLearn/1.0 (mailto:medlearn@example.com)' },
    timeout: 10000,
  })

  const work = response.data.message

  const title = Array.isArray(work.title) ? work.title[0] : work.title || 'Unknown Title'

  const authors = (work.author || []).map((a: { given?: string; family?: string }) => {
    return `${a.given || ''} ${a.family || ''}`.trim()
  })

  const abstract = work.abstract
    ? cheerio.load(work.abstract).text()
    : ''

  const year = work['published-print']?.['date-parts']?.[0]?.[0]
    || work['published-online']?.['date-parts']?.[0]?.[0]
    || null

  const journal = Array.isArray(work['container-title'])
    ? work['container-title'][0]
    : work['container-title'] || null

  return {
    title,
    authors,
    abstract,
    year: year ? parseInt(year) : null,
    journal,
    doi,
    openAccessUrl: work.URL || `https://doi.org/${doi}`,
    source: 'crossref',
  }
}

export function extractDOI(text: string): string | null {
  const doiMatch = text.match(/10\.\d{4,}\/[^\s"<>]+/)
  return doiMatch ? doiMatch[0] : null
}
