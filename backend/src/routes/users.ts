import { Router, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { attachPostInteractionFlags } from '../lib/postFlags'
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export const usersRouter = Router()

// --- GET /api/users/notifications ---
usersRouter.get('/notifications', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json({ notifications })
  } catch (err) {
    next(err)
  }
})

// --- PUT /api/users/notifications/read-all ---
usersRouter.put('/notifications/read-all', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, read: false },
      data: { read: true },
    })
    res.json({ message: 'All read' })
  } catch (err) {
    next(err)
  }
})

// --- PUT /api/users/notifications/:notificationId/read ---
usersRouter.put(
  '/notifications/:notificationId/read',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.notificationId as string
      const n = await prisma.notification.findFirst({
        where: { id: notificationId, userId: req.user!.userId },
      })
      if (!n) throw new AppError('Notification not found', 404)
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      })
      res.json({ message: 'Read' })
    } catch (err) {
      next(err)
    }
  }
)

// --- GET /api/users/bookmarks ---
usersRouter.get('/bookmarks', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user!.userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
                profilePhoto: true,
                headline: true,
              },
            },
            paper: true,
            _count: {
              select: { comments: true, bookmarks: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ bookmarks: bookmarks.map((b) => b.post) })
  } catch (err) {
    next(err)
  }
})

// --- GET /api/users/suggestions (people you may know) ---
usersRouter.get('/suggestions', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const me = req.user!.userId
    const existing = await prisma.connection.findMany({
      where: { OR: [{ fromUserId: me }, { toUserId: me }] },
    })
    const excludeIds = new Set<string>([me])
    for (const c of existing) {
      excludeIds.add(c.fromUserId)
      excludeIds.add(c.toUserId)
    }
    const suggestions = await prisma.user.findMany({
      where: { id: { notIn: [...excludeIds] } },
      select: {
        id: true,
        name: true,
        headline: true,
        role: true,
        profilePhoto: true,
        institution: true,
      },
      take: 10,
    })
    res.json({ suggestions })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/users/topics/follow ---
usersRouter.post('/topics/follow', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { topic } = req.body

    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'topic is required' })
      return
    }

    const topicNorm = topic.toLowerCase().trim()
    await prisma.topicFollow.upsert({
      where: { userId_topic: { userId: req.user!.userId, topic: topicNorm } },
      update: {},
      create: { userId: req.user!.userId, topic: topicNorm },
    })

    res.json({ message: 'Following topic' })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /api/users/topics/unfollow (body: { topic }) ---
usersRouter.delete('/topics/unfollow', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { topic } = req.body
    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'topic is required' })
      return
    }
    await prisma.topicFollow.deleteMany({
      where: { userId: req.user!.userId, topic: topic.toLowerCase().trim() },
    })
    res.json({ message: 'Unfollowed topic' })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /api/users/topics/:topic ---
usersRouter.delete('/topics/:topic', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const topic = req.params.topic as string

    await prisma.topicFollow.delete({
      where: {
        userId_topic: {
          userId: req.user!.userId,
          topic,
        },
      },
    })

    res.json({ message: 'Topic unfollowed' })
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e?.code === 'P2025') {
      res.status(404).json({ error: 'Not following this topic' })
      return
    }
    next(err)
  }
})

// --- GET /api/users/:id/topics ---
usersRouter.get('/:id/topics', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    if (req.user!.userId !== id) {
      res.status(403).json({ error: 'You can only view your own topics' })
      return
    }
    const rows = await prisma.topicFollow.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ topics: rows.map((t) => t.topic) })
  } catch (err) {
    next(err)
  }
})

// --- GET /api/users/:id/analytics ---
usersRouter.get('/:id/analytics', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id as string
    if (req.user!.userId !== userId) {
      res.status(403).json({ error: 'You can only view your own analytics' })
      return
    }

    const [totalPosts, totalLikes, totalComments, postsByType, recentPosts] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.post.aggregate({ where: { authorId: userId }, _sum: { likeCount: true } }),
      prisma.post.aggregate({ where: { authorId: userId }, _sum: { commentCount: true } }),
      prisma.post.groupBy({
        by: ['type'],
        where: { authorId: userId },
        _count: { _all: true },
      }),
      prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          content: true,
          likeCount: true,
          commentCount: true,
          createdAt: true,
          paperId: true,
        },
      }),
    ])

    res.json({
      totalPosts,
      totalLikes: totalLikes._sum.likeCount ?? 0,
      totalComments: totalComments._sum.commentCount ?? 0,
      postsByType,
      recentPosts,
    })
  } catch (err) {
    next(err)
  }
})

// --- GET /api/users/:id/posts ---
usersRouter.get('/:id/posts', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const cursor = req.query.cursor as string | undefined
    const limit = 20
    const uid = req.user?.userId

    const posts = await prisma.post.findMany({
      where: { authorId: id },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
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
        paper: {
          select: {
            id: true,
            title: true,
            authors: true,
            journal: true,
            year: true,
          },
        },
        _count: {
          select: {
            comments: true,
            bookmarks: true,
          },
        },
      },
    })

    const hasMore = posts.length > limit
    const results = hasMore ? posts.slice(0, limit) : posts
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1].id : null

    const mapped = uid ? await attachPostInteractionFlags(results, uid) : results

    res.json({
      posts: mapped,
      nextCursor,
      hasMore,
    })
  } catch (err) {
    next(err)
  }
})

// --- GET /api/users/:id/connections (all statuses; own profile only) ---
usersRouter.get('/:id/connections', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    if (req.user!.userId !== id) {
      res.status(403).json({ error: 'You can only view your own connections' })
      return
    }

    const connections = await prisma.connection.findMany({
      where: { OR: [{ fromUserId: id }, { toUserId: id }] },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            headline: true,
            role: true,
            profilePhoto: true,
            institution: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            headline: true,
            role: true,
            profilePhoto: true,
            institution: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ connections })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/users/:id/connect ---
usersRouter.post('/:id/connect', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const toUserId = req.params.id as string
    const fromUserId = req.user!.userId

    if (fromUserId === toUserId) {
      res.status(400).json({ error: 'Cannot connect to yourself' })
      return
    }

    const targetUser = await prisma.user.findUnique({ where: { id: toUserId } })
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      },
    })

    if (existing) {
      res.status(409).json({ error: 'Connection already exists', status: existing.status })
      return
    }

    const connection = await prisma.connection.create({
      data: { fromUserId, toUserId, status: 'pending' },
    })

    await prisma.notification.create({
      data: {
        userId: toUserId,
        type: 'connection_request',
        message: 'You have a new connection request',
      },
    })

    res.status(201).json({ connection })
  } catch (err) {
    next(err)
  }
})

// --- PUT /api/users/:id/connect ---
usersRouter.put('/:id/connect', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fromUserId = req.params.id as string
    const toUserId = req.user!.userId
    const { action } = req.body

    if (!action || !['accept', 'reject'].includes(action)) {
      res.status(400).json({ error: 'action must be "accept" or "reject"' })
      return
    }

    const connection = await prisma.connection.findUnique({
      where: {
        fromUserId_toUserId: { fromUserId, toUserId },
      },
    })

    if (!connection) {
      res.status(404).json({ error: 'Connection request not found' })
      return
    }

    if (connection.status !== 'pending') {
      res.status(400).json({ error: 'Connection request is no longer pending' })
      return
    }

    if (action === 'accept') {
      const updated = await prisma.connection.update({
        where: { fromUserId_toUserId: { fromUserId, toUserId } },
        data: { status: 'accepted' },
      })

      await prisma.notification.create({
        data: {
          userId: fromUserId,
          type: 'connection_accepted',
          message: 'Your connection request was accepted',
        },
      })

      res.json({ connection: updated })
    } else {
      await prisma.connection.delete({
        where: { fromUserId_toUserId: { fromUserId, toUserId } },
      })
      res.json({ message: 'Connection request rejected' })
    }
  } catch (err) {
    next(err)
  }
})

// --- GET /api/users/:id ---
usersRouter.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const isOwnProfile = req.user?.userId === id

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        headline: true,
        role: true,
        institution: true,
        bio: true,
        profilePhoto: true,
        bannerColor: true,
        interests: true,
        skills: true,
        isVerified: true,
        createdAt: true,
        email: true,
        _count: {
          select: {
            posts: true,
            connectionsFrom: true,
            connectionsTo: true,
          },
        },
      },
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const { _count, email, ...rest } = user
    const response: Record<string, unknown> = {
      ...rest,
      postCount: _count.posts,
      connectionCount: _count.connectionsFrom + _count.connectionsTo,
    }
    if (isOwnProfile) {
      response.email = email
    }

    res.json({ user: response })
  } catch (err) {
    next(err)
  }
})

// --- PUT /api/users/:id ---
usersRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string

    if (req.user!.userId !== id) {
      res.status(403).json({ error: 'You can only update your own profile' })
      return
    }

    const { name, headline, bio, institution, interests, skills, bannerColor } = req.body

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(headline !== undefined && { headline }),
        ...(bio !== undefined && { bio }),
        ...(institution !== undefined && { institution }),
        ...(interests !== undefined && { interests }),
        ...(skills !== undefined && { skills }),
        ...(bannerColor !== undefined && { bannerColor }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        headline: true,
        role: true,
        institution: true,
        bio: true,
        profilePhoto: true,
        bannerColor: true,
        interests: true,
        skills: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json({ user: updatedUser })
  } catch (err) {
    next(err)
  }
})
