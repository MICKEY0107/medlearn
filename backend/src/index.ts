import 'dotenv/config'
import path from 'path'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { authRouter } from './routes/auth'
import { usersRouter } from './routes/users'
import { postsRouter } from './routes/posts'
import { papersRouter } from './routes/papers'
import { aiRouter } from './routes/ai'
import { commentsRouter } from './routes/comments'
import { searchRouter } from './routes/search'
import { adminRouter } from './routes/admin'
import { connectionsRouter } from './routes/connections'
import { uploadRouter } from './routes/upload'
import { errorHandler } from './middleware/errorHandler'
import { rateLimiter } from './middleware/rateLimiter'

const app = express()
const PORT = process.env.PORT || 3001

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(rateLimiter)

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)
app.use('/api/papers', papersRouter)
app.use('/api/ai', aiRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/search', searchRouter)
app.use('/api/admin', adminRouter)
app.use('/api/connections', connectionsRouter)
app.use('/api/upload', uploadRouter)

// Error handler must be last
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`MedLearn API running on port ${PORT}`)
})

export default app
