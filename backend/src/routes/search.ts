import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

export const searchRouter = Router()

// --- GET /api/search/trending ---
searchRouter.get('/trending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const posts = await prisma.post.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { tags: true },
    })
    const tagCounts: Record<string, number> = {}
    posts.forEach((p) => p.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1
    }))
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, postCount]) => ({ tag, postCount, weeklyGrowth: 0 }))
    res.json({ topTags })
  } catch (err) {
    next(err)
  }
})

// --- GET /api/search --- Unified search
searchRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string
    if (!q || q.length < 2) {
      res.json({ papers: [], users: [], posts: [] })
      return
    }

    const queryLower = q.toLowerCase()

    const [papers, users, posts] = await Promise.all([
      prisma.paper.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { abstract: { contains: q, mode: 'insensitive' } },
            { authors: { hasSome: [q] } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          authors: true,
          year: true,
          journal: true,
        },
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { headline: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          headline: true,
          role: true,
          profilePhoto: true,
        },
      }),
      prisma.post.findMany({
        where: {
          OR: [
            { content: { contains: q, mode: 'insensitive' } },
            { tags: { has: queryLower } },
          ],
        },
        take: 10,
        include: {
          author: { select: { id: true, name: true, role: true, profilePhoto: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    res.json({ papers, users, posts })
  } catch (err) {
    next(err)
  }
})
