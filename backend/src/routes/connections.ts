import { Router, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export const connectionsRouter = Router()

connectionsRouter.use(authenticate)

// PUT /api/connections/:userId/accept — accept pending request from :userId
connectionsRouter.put('/:userId/accept', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fromUserId = req.params.userId as string
    const toUserId = req.user!.userId

    const connection = await prisma.connection.findUnique({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
    })

    if (!connection) throw new AppError('Connection request not found', 404)
    if (connection.status !== 'pending') throw new AppError('Connection request is no longer pending', 400)

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

    res.json({ message: 'Connection accepted', connection: updated })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/connections/:userId/decline — decline pending or remove any link with this user
connectionsRouter.delete('/:userId/decline', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const otherId = req.params.userId as string
    const me = req.user!.userId

    const deleted = await prisma.connection.deleteMany({
      where: {
        OR: [
          { fromUserId: otherId, toUserId: me },
          { fromUserId: me, toUserId: otherId },
        ],
      },
    })

    res.json({ message: 'Connection removed', count: deleted.count })
  } catch (err) {
    next(err)
  }
})
