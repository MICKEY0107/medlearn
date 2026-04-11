import { Router, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

export const uploadRouter = Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'profiles')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg'
    const u = (req as AuthRequest).user
    cb(null, `${u?.userId ?? 'user'}-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only images allowed'))
  },
})

uploadRouter.post(
  '/profile-photo',
  authenticate,
  (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
      if (err) next(err)
      else next()
    })
  },
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' })
        return
      }
      const photoUrl = `/uploads/profiles/${req.file.filename}`
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { profilePhoto: photoUrl },
      })
      res.json({ photoUrl })
    } catch (err) {
      next(err)
    }
  }
)
