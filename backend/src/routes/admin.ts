import { Router, Response, NextFunction } from 'express'
import { authenticate, AuthRequest, requireRole } from '../middleware/auth'
import { prisma } from '../lib/prisma'

export const adminRouter = Router()
adminRouter.use(authenticate, requireRole('admin'))

adminRouter.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalPapers, postsThisWeek, flaggedPosts, flaggedComments] = await Promise.all([
      prisma.user.count(),
      prisma.paper.count(),
      prisma.post.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.post.count({ where: { isFlagged: true } }),
      prisma.comment.count({ where: { isFlagged: true } }),
    ])
    res.json({
      totalUsers,
      totalPapers,
      postsThisWeek,
      flaggedPending: flaggedPosts + flaggedComments,
    })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/flagged', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [posts, comments] = await Promise.all([
      prisma.post.findMany({
        where: { isFlagged: true },
        include: { author: { select: { name: true } } },
        take: 20,
      }),
      prisma.comment.findMany({
        where: { isFlagged: true },
        include: { author: { select: { name: true } } },
        take: 20,
      }),
    ])
    res.json({ flaggedPosts: posts, flaggedComments: comments })
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/posts/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    await prisma.post.delete({ where: { id } })
    res.json({ message: 'Removed' })
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/users/:id/warn', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.create({
      data: {
        userId: req.params.id as string,
        type: 'warning',
        message: 'Your account has received a warning for violating community guidelines.',
      },
    })
    res.json({ message: 'Warning sent' })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institution: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ users })
  } catch (err) {
    next(err)
  }
})
