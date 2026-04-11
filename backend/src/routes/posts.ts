import { Router, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { attachPostInteractionFlags } from '../lib/postFlags'
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export const postsRouter = Router()

const postInclude: Prisma.PostInclude = {
  author: {
    select: {
      id: true,
      name: true,
      headline: true,
      role: true,
      profilePhoto: true,
      institution: true,
    },
  },
  paper: {
    select: {
      id: true,
      title: true,
      authors: true,
      journal: true,
      year: true,
      doi: true,
      source: true,
      openAccessUrl: true,
      tags: true,
    },
  },
  _count: {
    select: {
      comments: true,
      bookmarks: true,
    },
  },
}

// --- GET /api/posts --- Feed with filters
postsRouter.get('/', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cursor, type, tag, following, limit: limitQ } = req.query
    const take = Math.min(parseInt((limitQ as string) || '20', 10) || 20, 50)
    const where: Prisma.PostWhereInput = {}

    if (type && typeof type === 'string') {
      where.type = type as Prisma.EnumPostTypeFilter['equals']
    }
    if (tag && typeof tag === 'string') {
      where.tags = { has: tag }
    }
    if (following === 'true' && req.user) {
      const connections = await prisma.connection.findMany({
        where: { fromUserId: req.user.userId, status: 'accepted' },
        select: { toUserId: true },
      })
      const ids = connections.map((c) => c.toUserId)
      ids.push(req.user.userId)
      where.authorId = { in: ids }
    }

    const uid = req.user?.userId
    const posts = await prisma.post.findMany({
      where,
      take: take + 1,
      ...(cursor && typeof cursor === 'string'
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: { createdAt: 'desc' },
      include: postInclude,
    })

    const hasMore = posts.length > take
    const slice = hasMore ? posts.slice(0, take) : posts
    const nextCursor = hasMore && slice.length > 0 ? slice[slice.length - 1].id : null

    const results = uid ? await attachPostInteractionFlags(slice, uid) : slice

    res.json({
      posts: results,
      nextCursor,
      hasMore,
    })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/posts --- Create post (before /:id routes)
postsRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, content, paperId, derivedFromPaper, derivedFromPaperId } = req.body
    const userId = req.user!.userId
    const derivedPaperRef = derivedFromPaper ?? derivedFromPaperId ?? null

    if (!type || !content) {
      res.status(400).json({ error: 'type and content are required' })
      return
    }

    const post = await prisma.post.create({
      data: {
        type,
        content,
        authorId: userId,
        ...(paperId && { paperId }),
        derivedFromPaper: derivedPaperRef || null,
      },
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
    })

    res.status(201).json({ post })
  } catch (err) {
    next(err)
  }
})

// --- GET /api/posts/:id/comments ---
postsRouter.get('/:id/comments', async (req, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    const comments = await prisma.comment.findMany({
      where: { postId, parentCommentId: null },
      include: {
        author: {
          select: { id: true, name: true, headline: true, role: true, profilePhoto: true },
        },
        replies: {
          include: {
            author: { select: { id: true, name: true, headline: true, role: true, profilePhoto: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json({ comments })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/posts/:id/comments ---
postsRouter.post('/:id/comments', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    const { content, parentCommentId } = req.body
    if (!content?.trim()) throw new AppError('Comment content is required', 400)

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) throw new AppError('Post not found', 404)

    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          postId,
          authorId: req.user!.userId,
          content: content.trim(),
          parentCommentId: parentCommentId || null,
        },
        include: {
          author: { select: { id: true, name: true, headline: true, role: true, profilePhoto: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true, headline: true, role: true, profilePhoto: true } },
            },
          },
        },
      })
      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      })
      await tx.discussionSummary.updateMany({
        where: { postId },
        data: { isValid: false },
      })
      return newComment
    })

    if (post.authorId !== req.user!.userId) {
      const commenter = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { name: true },
      })
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: 'comment',
          message: `${commenter?.name ?? 'Someone'} commented on your post`,
        },
      })
    }

    res.status(201).json({ comment })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/posts/:id/bookmark ---
postsRouter.post('/:id/bookmark', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    const userId = req.user!.userId

    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    })

    if (existing) {
      await prisma.bookmark.delete({ where: { userId_postId: { userId, postId } } })
      res.json({ bookmarked: false })
    } else {
      await prisma.bookmark.create({ data: { userId, postId } })
      res.json({ bookmarked: true })
    }
  } catch (err) {
    next(err)
  }
})

// --- DELETE /api/posts/:id/bookmark ---
postsRouter.delete('/:id/bookmark', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    const userId = req.user!.userId

    await prisma.bookmark.deleteMany({ where: { userId, postId } })
    res.json({ bookmarked: false })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/posts/:id/like ---
postsRouter.post('/:id/like', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    const userId = req.user!.userId
    const targetType = 'post'

    const existing = await prisma.like.findUnique({
      where: {
        userId_targetId_targetType: {
          userId,
          targetId: postId,
          targetType,
        },
      },
    })

    if (existing) {
      res.json({ liked: true })
      return
    }

    await prisma.$transaction(async (tx) => {
      await tx.like.create({
        data: { userId, targetId: postId, targetType },
      })
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      })
    })

    res.json({ liked: true })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /api/posts/:id/like ---
postsRouter.delete('/:id/like', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    const userId = req.user!.userId

    await prisma.$transaction(async (tx) => {
      const deleted = await tx.like.deleteMany({
        where: { userId, targetId: postId, targetType: 'post' },
      })
      if (deleted.count > 0) {
        await tx.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        })
      }
    })

    res.json({ message: 'Unliked' })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /api/posts/:id ---
postsRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) throw new AppError('Post not found', 404)
    if (post.authorId !== req.user!.userId && req.user!.role !== 'admin') {
      throw new AppError('Not authorised', 403)
    }
    await prisma.post.delete({ where: { id: postId } })
    res.json({ message: 'Post deleted' })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/posts/:id/repost ---
postsRouter.post('/:id/repost', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    await prisma.post.update({
      where: { id: postId },
      data: { repostCount: { increment: 1 } },
    })
    res.json({ message: 'Reposted' })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/posts/:id/report ---
postsRouter.post('/:id/report', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    await prisma.post.update({
      where: { id: postId },
      data: { isFlagged: true },
    })
    res.json({ message: 'Reported' })
  } catch (err) {
    next(err)
  }
})

// --- GET /api/posts/:id ---
postsRouter.get('/:id', optionalAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const postId = req.params.id as string
    const uid = req.user?.userId
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            headline: true,
            role: true,
            profilePhoto: true,
            institution: true,
          },
        },
        paper: true,
        _count: {
          select: {
            comments: true,
            bookmarks: true,
          },
        },
      },
    })

    if (!post) throw new AppError('Post not found', 404)
    const [flagged] = uid ? await attachPostInteractionFlags([post], uid) : [post]
    const out = flagged
    res.json({ post: out })
  } catch (err) {
    next(err)
  }
})
