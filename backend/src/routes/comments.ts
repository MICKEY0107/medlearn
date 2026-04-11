import { Router, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export const commentsRouter = Router()

// --- POST /api/comments/:id/best-answer ---
commentsRouter.post('/:id/best-answer', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const commentId = req.params.id as string
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    })
    if (!comment) throw new AppError('Comment not found', 404)
    if (comment.post.authorId !== req.user!.userId) {
      throw new AppError('Only the post author can mark best answers', 403)
    }

    await prisma.$transaction([
      prisma.comment.updateMany({
        where: { postId: comment.postId },
        data: { isBestAnswer: false },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { isBestAnswer: true },
      }),
    ])

    res.json({ message: 'Best answer marked' })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/comments/:id/like ---
commentsRouter.post('/:id/like', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const commentId = req.params.id as string
    const userId = req.user!.userId
    const targetType = 'comment'

    const existing = await prisma.like.findUnique({
      where: {
        userId_targetId_targetType: { userId, targetId: commentId, targetType },
      },
    })

    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({
          where: {
            userId_targetId_targetType: { userId, targetId: commentId, targetType },
          },
        }),
        prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ])
      return res.json({ message: 'Unliked' })
    }

    await prisma.$transaction([
      prisma.like.create({
        data: { userId, targetId: commentId, targetType },
      }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      }),
    ])
    res.json({ message: 'Liked' })
  } catch (err) {
    next(err)
  }
})
