import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.message}`, err.stack)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
    return
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({ error: 'Database operation failed' })
    return
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message })
    return
  }

  const anyErr = err as Error & { statusCode?: number; status?: number }
  if (anyErr.message === 'Only images allowed') {
    res.status(400).json({ error: anyErr.message })
    return
  }
  if (anyErr.statusCode || anyErr.status) {
    const status = anyErr.statusCode || anyErr.status || 500
    res.status(status).json({ error: anyErr.message || 'Request failed' })
    return
  }

  res.status(500).json({ error: 'Internal server error' })
}
