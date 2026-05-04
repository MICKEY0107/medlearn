import { Router, Response } from 'express'
import multer from 'multer'
import { authenticate, AuthRequest } from '../middleware/auth'
import { ingestPaper } from '../services/ingestion'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import { generatePaperTags, rankSimilarPapers } from '../services/mlService'

export const papersRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed'))
  },
})

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

    generateTagsAsync(paper.id, paper.title, paper.abstract, paper.authors, paper.year, paper.journal, paper.source).catch(console.error)

    res.status(201).json({ paper })
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error('Ingestion error:', error)
    const message = error instanceof Error ? error.message : 'Failed to process paper'
    res.status(422).json({ error: message })
  }
})

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

papersRouter.get('/:id/similar', async (req, res, next) => {
  try {
    const id = req.params.id as string
    const paper = await prisma.paper.findUnique({ where: { id } })
    if (!paper) throw new AppError('Paper not found', 404)

    const candidates = await prisma.paper.findMany({
      where: { id: { not: id } },
      select: {
        id: true,
        title: true,
        authors: true,
        abstract: true,
        year: true,
        journal: true,
        tags: true,
      },
      take: 200,
    })

    const papers = rankSimilarPapers(
      {
        id: paper.id,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        tags: paper.tags,
        year: paper.year,
        journal: paper.journal,
        source: paper.source,
      },
      candidates.map((candidate) => ({
        id: candidate.id,
        title: candidate.title,
        abstract: candidate.abstract,
        authors: candidate.authors,
        tags: candidate.tags,
        year: candidate.year,
        journal: candidate.journal,
      }))
    )

    res.json({ papers })
  } catch (err) {
    next(err)
  }
})

async function generateTagsAsync(
  paperId: string,
  title: string,
  abstract: string,
  authors: string[],
  year?: number | null,
  journal?: string | null,
  source?: string | null
) {
  try {
    const tags = await generatePaperTags({
      id: paperId,
      title,
      abstract,
      authors,
      tags: [],
      year,
      journal,
      source,
    })

    if (tags.length > 0) {
      await prisma.paper.update({
        where: { id: paperId },
        data: { tags },
      })
    }
  } catch (error) {
    console.error('Tag generation failed:', error)
  }
}
