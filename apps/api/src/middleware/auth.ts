import { Context, Next } from 'hono'
import { verifyAccessToken } from '../lib/jwt'
import { AppError, AuthError } from '../utils/errors'
import { getCookie } from 'hono/cookie'

export const checkAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
  const token = bearer || getCookie(c, 'accessToken')

  if (!token) {
    throw new AuthError('Authentication required.', 'AUTH_REQUIRED', 401)
  }

  try {
    const payload = verifyAccessToken(token)
    c.set('user', payload)
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthError('Session expired. Please log in again.', 'AUTH_TOKEN_EXPIRED', 401)
    }
    throw new AuthError('Invalid authentication token.', 'AUTH_TOKEN_INVALID', 401)
  }

  await next()
}

export const requireRole = (role: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as { role?: string } | undefined
    if (!user || user.role !== role) {
      throw new AppError('You do not have permission to perform this action.', 'FORBIDDEN', 403)
    }
    await next()
  }
}
