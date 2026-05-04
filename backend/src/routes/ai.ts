import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { aiRateLimiter } from '../middleware/rateLimiter'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import {
  normalizeSimplifyResult,
  normalizeProjectIdeasResult,
  normalizeConceptPathResult,
} from '../lib/aiDemoNormalize'
import {
  generateConceptPath,
  generateDiscussionSummary,
  generateProjectIdeas,
  generateSimplifyResult,
} from '../services/mlService'

export const aiRouter = Router()

async function getAICache(paperId: string, cacheType: string, level?: string) {
  return prisma.aICache.findUnique({
    where: {
      paperId_cacheType_level: { paperId, cacheType, level: level || '' },
    },
  })
}

async function setAICache(paperId: string, cacheType: string, content: unknown, level?: string) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  return prisma.aICache.upsert({
    where: {
      paperId_cacheType_level: { paperId, cacheType, level: level || '' },
    },
    update: { content: content as any, expiresAt },
    create: { paperId, cacheType, level: level || '', content: content as any, expiresAt },
  })
}

async function isCacheValid(cache: { expiresAt: Date } | null): Promise<boolean> {
  if (!cache) return false
  return cache.expiresAt > new Date()
}

aiRouter.post('/simplify', authenticate, aiRateLimiter, async (req: AuthRequest, res: Response) => {
  const { paperId, level = 'student' } = req.body

  if (!paperId) throw new AppError('paperId is required', 400)
  if (!['student', 'researcher'].includes(level)) throw new AppError('level must be student or researcher', 400)

  const paper = await prisma.paper.findUnique({ where: { id: paperId } })
  if (!paper) throw new AppError('Paper not found', 404)
  if (!paper.abstract) throw new AppError('This paper has no abstract to summarise', 422)

  const cached = await getAICache(paperId, 'simplify', level)
  if (await isCacheValid(cached)) {
    const result = normalizeSimplifyResult(cached!.content)
    return res.json({ result, cached: true })
  }

  const result = await generateSimplifyResult(
    {
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors,
      tags: paper.tags,
      year: paper.year,
      journal: paper.journal,
      source: paper.source,
    },
    level
  )

  await setAICache(paperId, 'simplify', result, level)

  res.json({ result, cached: false })
})

aiRouter.post('/project-ideas', authenticate, aiRateLimiter, async (req: AuthRequest, res: Response) => {
  const { paperId } = req.body

  if (!paperId) throw new AppError('paperId is required', 400)

  const paper = await prisma.paper.findUnique({ where: { id: paperId } })
  if (!paper) throw new AppError('Paper not found', 404)

  const cached = await getAICache(paperId, 'project_ideas')
  if (await isCacheValid(cached)) {
    const result = normalizeProjectIdeasResult(cached!.content)
    return res.json({ result, cached: true })
  }

  const simplifyCache = await getAICache(paperId, 'simplify', 'researcher')
  const keyFindings = simplifyCache
    ? (simplifyCache.content as { key_findings?: string[] })?.key_findings?.join(', ') || ''
    : ''

  const result = await generateProjectIdeas(
    {
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors,
      tags: paper.tags,
      year: paper.year,
      journal: paper.journal,
      source: paper.source,
    },
    keyFindings
  )

  await setAICache(paperId, 'project_ideas', result)

  res.json({ result, cached: false })
})

aiRouter.post('/concept-path', authenticate, aiRateLimiter, async (req: AuthRequest, res: Response) => {
  const { paperId } = req.body

  if (!paperId) throw new AppError('paperId is required', 400)

  const paper = await prisma.paper.findUnique({ where: { id: paperId } })
  if (!paper) throw new AppError('Paper not found', 404)

  const cached = await getAICache(paperId, 'concept_path')
  if (await isCacheValid(cached)) {
    const result = normalizeConceptPathResult(cached!.content)
    return res.json({ result, cached: true })
  }

  const result = await generateConceptPath({
    title: paper.title,
    abstract: paper.abstract,
    authors: paper.authors,
    tags: paper.tags,
    year: paper.year,
    journal: paper.journal,
    source: paper.source,
  })

  await setAICache(paperId, 'concept_path', result)

  res.json({ result, cached: false })
})

aiRouter.post('/summarise-discussion', authenticate, async (req: AuthRequest, res: Response) => {
  const { postId } = req.body

  if (!postId) throw new AppError('postId is required', 400)

  const existing = await prisma.discussionSummary.findUnique({ where: { postId } })
  const comments = await prisma.comment.findMany({
    where: { postId, parentCommentId: null },
    include: { author: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  })

  if (comments.length < 10) {
    throw new AppError('Discussion needs at least 10 comments to summarise', 400)
  }

  if (existing?.isValid && existing.commentCountAtGeneration >= comments.length - 2) {
    return res.json({
      result: {
        key_claims: existing.keyClaims,
        consensus_points: existing.consensusPoints,
        open_questions: existing.openQuestions,
      },
      cached: true,
    })
  }

  const result = await generateDiscussionSummary(comments)

  await prisma.discussionSummary.upsert({
    where: { postId },
    update: {
      keyClaims: result.key_claims,
      consensusPoints: result.consensus_points,
      openQuestions: result.open_questions,
      commentCountAtGeneration: comments.length,
      isValid: true,
    },
    create: {
      postId,
      keyClaims: result.key_claims,
      consensusPoints: result.consensus_points,
      openQuestions: result.open_questions,
      commentCountAtGeneration: comments.length,
    },
  })

  res.json({ result, cached: false })
})
