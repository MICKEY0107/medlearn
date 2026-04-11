import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
  isRefreshTokenValid,
  TokenPayload,
} from '../lib/jwt'
import { authenticate, AuthRequest } from '../middleware/auth'
import { authRateLimiter } from '../middleware/rateLimiter'

export const authRouter = Router()

// --- Validation helper ---
function validateBody(schema: Record<string, { required?: boolean; type?: string; minLength?: number; pattern?: RegExp; patternMessage?: string }>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = []
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field]
      if (rules.required && !value) {
        errors.push(`${field} is required`)
        continue
      }
      if (value && rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`)
      }
      if (value && rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.patternMessage || `${field} format is invalid`)
      }
    }
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(', ') })
      return
    }
    next()
  }
}

// --- POST /api/auth/register ---
authRouter.post(
  '/register',
  authRateLimiter,
  validateBody({
    name: { required: true, minLength: 2 },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'email must be a valid email address',
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
      patternMessage: 'password must contain at least one letter and one number',
    },
    role: {
      required: true,
      pattern: /^(student|doctor|researcher|lab)$/,
      patternMessage: 'role must be one of: student, doctor, researcher, lab',
    },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = req.body

      // Check if email already registered
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        res.status(409).json({ error: 'Email is already registered' })
        return
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      })

      // Generate tokens
      const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role }
      const accessToken = generateAccessToken(payload)
      const refreshToken = generateRefreshToken(payload)

      // Save refresh token
      await saveRefreshToken(user.id, refreshToken)

      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          headline: user.headline,
          institution: user.institution,
        },
        accessToken,
        refreshToken,
      })
    } catch (err) {
      next(err)
    }
  }
)

// --- POST /api/auth/login ---
authRouter.post(
  '/login',
  authRateLimiter,
  validateBody({
    email: { required: true },
    password: { required: true },
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body

      // Find user
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      // Verify password
      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      // Generate tokens
      const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role }
      const accessToken = generateAccessToken(payload)
      const refreshToken = generateRefreshToken(payload)

      // Save refresh token
      await saveRefreshToken(user.id, refreshToken)

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          headline: user.headline,
          institution: user.institution,
          profilePhoto: user.profilePhoto,
        },
        accessToken,
        refreshToken,
      })
    } catch (err) {
      next(err)
    }
  }
)

// --- POST /api/auth/refresh ---
authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' })
      return
    }

    // Verify token signature
    let payload: TokenPayload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      res.status(401).json({ error: 'Invalid refresh token' })
      return
    }

    // Check token exists in DB and not expired
    const isValid = await isRefreshTokenValid(refreshToken)
    if (!isValid) {
      res.status(401).json({ error: 'Refresh token expired or revoked' })
      return
    }

    // Delete old refresh token (rotation)
    await revokeRefreshToken(refreshToken)

    // Generate new tokens
    const newPayload: TokenPayload = { userId: payload.userId, email: payload.email, role: payload.role }
    const newAccessToken = generateAccessToken(newPayload)
    const newRefreshToken = generateRefreshToken(newPayload)

    // Save new refresh token
    await saveRefreshToken(payload.userId, newRefreshToken)

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (err) {
    next(err)
  }
})

// --- POST /api/auth/logout ---
authRouter.post('/logout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }

    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
})

// --- GET /api/auth/me ---
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        headline: true,
        institution: true,
        bio: true,
        profilePhoto: true,
        interests: true,
        skills: true,
        isVerified: true,
        createdAt: true,
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

    res.json({
      user: {
        ...user,
        connectionCount: user._count.connectionsFrom + user._count.connectionsTo,
        postCount: user._count.posts,
        _count: undefined,
      },
    })
  } catch (err) {
    next(err)
  }
})
