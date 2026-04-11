const pdfParse = require('pdf-parse')
import Anthropic from '@anthropic-ai/sdk'
import { PaperMetadata } from './pubmed'

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

export async function resolvePDF(buffer: Buffer): Promise<PaperMetadata> {
  const data = await pdfParse(buffer)
  const text = data.text.substring(0, 4000)

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Extract metadata from this academic paper text. Return ONLY valid JSON, no other text, no markdown:

{
  "title": "string",
  "authors": ["string"],
  "abstract": "string (the full abstract text)",
  "year": number or null,
  "journal": "string or null"
}

Paper text:
${text}`,
    }],
  })

  try {
    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      ...parsed,
      doi: null,
      openAccessUrl: null,
      source: 'pdf',
    }
  } catch {
    throw new Error('Could not extract metadata from PDF')
  }
}
