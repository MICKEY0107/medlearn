import axios from 'axios'
import { parseStringPromise } from 'xml2js'

export interface PaperMetadata {
  title: string
  authors: string[]
  abstract: string
  year: number | null
  journal: string | null
  doi: string | null
  openAccessUrl: string | null
  source: string
}

export async function resolvePubMed(input: string): Promise<PaperMetadata> {
  const pmid = extractPMID(input)
  if (!pmid) throw new Error('Could not extract PMID from input')

  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`
  const params = {
    db: 'pubmed',
    id: pmid,
    retmode: 'xml',
    tool: 'medlearn',
    email: 'medlearn@example.com',
  }

  const response = await axios.get(url, { params, timeout: 10000 })
  const parsed = await parseStringPromise(response.data)

  const article = parsed?.PubmedArticleSet?.PubmedArticle?.[0]?.MedlineCitation?.[0]?.Article?.[0]
  if (!article) throw new Error('Could not parse PubMed response')

  const title = article.ArticleTitle?.[0] || 'Unknown Title'

  const authorList = article.AuthorList?.[0]?.Author || []
  const authors = authorList.map((a: Record<string, string[]>) => {
    const last = a.LastName?.[0] || ''
    const fore = a.ForeName?.[0] || ''
    return `${fore} ${last}`.trim()
  }).filter(Boolean)

  const abstractTexts = article.Abstract?.[0]?.AbstractText || []
  const abstract = abstractTexts
    .map((t: string | Record<string, string[]>) =>
      typeof t === 'string' ? t : t._ || Object.values(t).join(' ')
    )
    .join(' ')

  const journal = parsed?.PubmedArticleSet?.PubmedArticle?.[0]?.MedlineCitation?.[0]
    ?.MedlineJournalInfo?.[0]?.MedlineTA?.[0] || null

  const pubDate = article.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0]
  const year = pubDate?.Year?.[0] ? parseInt(pubDate.Year[0]) : null

  const articleIds = parsed?.PubmedArticleSet?.PubmedArticle?.[0]
    ?.PubmedData?.[0]?.ArticleIdList?.[0]?.ArticleId || []

  let doi: string | null = null
  for (const id of articleIds) {
    if (id.$?.IdType === 'doi') {
      doi = typeof id === 'string' ? id : id._
      break
    }
  }

  return {
    title,
    authors,
    abstract: abstract || '',
    year,
    journal,
    doi,
    openAccessUrl: doi ? `https://doi.org/${doi}` : null,
    source: 'pubmed',
  }
}

function extractPMID(input: string): string | null {
  const pmidMatch = input.match(/(?:pubmed\.ncbi\.nlm\.nih\.gov\/|PMID:?\s*)(\d+)/i)
  if (pmidMatch) return pmidMatch[1]
  if (/^\d+$/.test(input.trim())) return input.trim()
  return null
}
