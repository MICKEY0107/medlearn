import { Router, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { authenticate, AuthRequest } from '../middleware/auth'
import { aiRateLimiter } from '../middleware/rateLimiter'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/errorHandler'
import {
  normalizeSimplifyResult,
  normalizeProjectIdeasResult,
  normalizeConceptPathResult,
  claudeConfigured,
} from '../lib/aiDemoNormalize'

export const aiRouter = Router()

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY || 'sk-ant-placeholder' })

// ─── CACHE HELPERS ────────────────────────────────────────────────────────────

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

// ─── SIMPLIFY ─────────────────────────────────────────────────────────────────

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

  if (!claudeConfigured()) {
    throw new AppError('No cached summary for this paper and Claude API is not configured.', 503)
  }

  const levelInstruction = level === 'student'
    ? 'Use no jargon. Write as if explaining to a curious first-year medical student. Use analogies where helpful.'
    : 'Preserve technical terms. Include statistical framing. Write for a peer researcher.'

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a biomedical research analyst. Analyse this paper and return ONLY valid JSON with no other text, no markdown, no explanation.

${levelInstruction}

Return this exact structure:
{
  "plain_summary": "2-3 sentence explanation of what this paper found and why it matters",
  "key_findings": ["finding 1", "finding 2", "finding 3", "finding 4"],
  "methodology_type": "one of: RCT | Cohort Study | Meta-Analysis | Systematic Review | Case Study | Experimental | Computational | Other",
  "methodology_detail": "one sentence describing study design, sample size, duration",
  "limitations": ["limitation 1", "limitation 2"],
  "study_population": "who was studied, how many, what setting"
}

Only use information from the paper. Do not invent findings.

Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Abstract: ${paper.abstract}`,
    }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new AppError('AI service returned unexpected response', 500)

  let result
  try {
    result = JSON.parse(content.text.replace(/```json|```/g, '').trim())
  } catch {
    throw new AppError('AI service returned malformed response. Please try again.', 500)
  }

  await setAICache(paperId, 'simplify', result, level)

  res.json({ result, cached: false })
})

// ─── PROJECT IDEAS ─────────────────────────────────────────────────────────────

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

  if (!claudeConfigured()) {
    throw new AppError('No cached project ideas for this paper and Claude API is not configured.', 503)
  }

  const simplifyCache = await getAICache(paperId, 'simplify', 'researcher')
  const keyFindings = simplifyCache
    ? (simplifyCache.content as { key_findings?: string[] })?.key_findings?.join(', ') || ''
    : ''

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `You are a research-to-project advisor for healthcare students. Generate exactly 3 student-buildable project proposals from this paper. Return ONLY a valid JSON array with no other text, no markdown, no explanation.

Rules:
- One beginner (2-3 weeks, no ML required), one intermediate (4-6 weeks, basic ML acceptable), one advanced (8-12 weeks, research-level)
- Datasets must be real and publicly available: Kaggle, PhysioNet, MIMIC-III, UCI ML Repository, NIH open data
- Be specific — vague ideas are useless to students
- Tech stacks must be realistic for the difficulty level

Return this exact structure:
[
  {
    "difficulty": "beginner",
    "estimated_weeks": 3,
    "project_title": "string",
    "problem_statement": "string",
    "approach": "string",
    "tech_stack": ["string"],
    "dataset_name": "string",
    "dataset_url": "string"
  },
  { ...intermediate... },
  { ...advanced... }
]

Paper title: ${paper.title}
Abstract: ${paper.abstract}
${keyFindings ? `Key findings: ${keyFindings}` : ''}`,
    }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new AppError('AI service error', 500)

  let result
  try {
    result = JSON.parse(content.text.replace(/```json|```/g, '').trim())
    if (!Array.isArray(result) || result.length !== 3) throw new Error('Invalid structure')
  } catch {
    throw new AppError('AI returned malformed project ideas. Please try again.', 500)
  }

  await setAICache(paperId, 'project_ideas', result)

  res.json({ result, cached: false })
})

// ─── CONCEPT PATH ──────────────────────────────────────────────────────────────

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

  if (!claudeConfigured()) {
    throw new AppError('No cached concept path for this paper and Claude API is not configured.', 503)
  }

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a learning path designer for healthcare students. Identify 3-6 prerequisite concepts a student must understand before this paper makes full sense. Return ONLY valid JSON with no other text, no markdown.

Rules:
- Order from most foundational to most advanced
- Only use these resource sources: Khan Academy, YouTube (Osmosis, StatQuest, Armando Hasudungan, NEJM channels only), Coursera free audit, NCBI PMC review articles, Wikipedia for definitions only
- Concept names must be specific — not "biology", say "Kaplan-Meier survival curves"
- resource_url must be a real working URL from the allowed sources

Return this structure:
{
  "concepts": [
    {
      "concept_name": "string",
      "why_needed": "one sentence connecting this concept to understanding the paper",
      "resource_type": "video | article | course | definition",
      "resource_title": "string",
      "resource_url": "string"
    }
  ]
}

Paper title: ${paper.title}
Abstract: ${paper.abstract}
Tags: ${paper.tags.join(', ')}`,
    }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new AppError('AI service error', 500)

  let result
  try {
    result = JSON.parse(content.text.replace(/```json|```/g, '').trim())
    if (!result.concepts || !Array.isArray(result.concepts)) throw new Error('Invalid structure')
  } catch {
    throw new AppError('AI returned malformed concept path. Please try again.', 500)
  }

  await setAICache(paperId, 'concept_path', result)

  res.json({ result, cached: false })
})

// ─── DISCUSSION SUMMARY ────────────────────────────────────────────────────────

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

  const commentText = comments
    .map((c: any) => `${c.author.name} (${c.author.role}): ${c.content}`)
    .join('\n\n')

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Summarise this discussion thread from a healthcare research post. Return ONLY valid JSON:

{
  "key_claims": ["claim 1", "claim 2", "claim 3"],
  "consensus_points": ["point 1", "point 2"],
  "open_questions": ["question 1", "question 2"]
}

Rules:
- Only include claims actually made in the comments — do not invent
- Maximum 3 items per array
- Each item maximum 25 words

Comments:
${commentText.substring(0, 3000)}`,
    }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new AppError('AI service error', 500)

  let result
  try {
    result = JSON.parse(content.text.replace(/```json|```/g, '').trim())
  } catch {
    throw new AppError('AI returned malformed discussion summary', 500)
  }

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
