import { Router, Response } from 'express'
import multer from 'multer'
import { authenticate, AuthRequest } from '../middleware/auth'
import { ingestPaper } from '../services/ingestion'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'

export const papersRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed'))
  },
})

// POST /api/papers/ingest
papersRouter.post('/ingest', authenticate, upload.single('pdf'), async (req: AuthRequest, res: Response) => {
  try {
    let metadata

    if (req.file) {
      metadata = await ingestPaper({ type: 'pdf', buffer: req.file.buffer })
    } else if (req.body.url) {
      metadata = await ingestPaper({ type: 'url', url: req.body.url })
    } else if (req.body.title && req.body.abstract) {
      metadata = await ingestPaper({
        type: 'manual',
        title: req.body.title,
        abstract: req.body.abstract,
        authors: req.body.authors || [],
      })
    } else {
      throw new AppError('Provide a URL, PDF file, or title and abstract', 400)
    }

    if (!metadata.abstract || metadata.abstract.length < 20) {
      throw new AppError('Could not extract sufficient abstract content. Please enter it manually.', 422)
    }

    const paper = await prisma.paper.create({
      data: {
        title: metadata.title,
        authors: metadata.authors,
        abstract: metadata.abstract,
        year: metadata.year,
        journal: metadata.journal,
        source: metadata.source,
        doi: metadata.doi,
        openAccessUrl: metadata.openAccessUrl,
        tags: [],
        postedBy: req.user!.userId,
      },
    })

    // Generate tags async — do not await
    generateTagsAsync(paper.id, paper.title, paper.abstract).catch(console.error)

    res.status(201).json({ paper })
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error('Ingestion error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process paper'
    res.status(422).json({ error: message })
  }
})

// GET /api/papers/:id
papersRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id as string
    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        posts: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                headline: true,
                role: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    })
    if (!paper) throw new AppError('Paper not found', 404)
    res.json({ paper })
  } catch (err) {
    next(err)
  }
})

// GET /api/papers/:id/similar
papersRouter.get('/:id/similar', async (req, res) => {
  // Phase 2 with ML service — return empty for now
  res.json({ papers: [] })
})

async function generateTagsAsync(paperId: string, title: string, abstract: string) {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Generate 5-8 specific medical/research topic tags for this paper. Return ONLY a JSON array of strings, no other text:

Title: ${title}
Abstract: ${abstract.substring(0, 500)}`,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') return

    const tagsStr = content.text.replace(/```json|```/g, '').trim()
    const tags = JSON.parse(tagsStr)
    if (Array.isArray(tags)) {
      await prisma.paper.update({
        where: { id: paperId },
        data: { tags },
      })
    }
  } catch (error) {
    console.error('Tag generation failed:', error)
  }
}
