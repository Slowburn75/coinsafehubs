import { Context, Next } from 'hono'
import { verifyAccessToken } from '../lib/jwt'
import { AppError } from '../utils/errors'
import { getCookie } from 'hono/cookie'

export const checkAuth = async (c: Context, next: Next) => {
    const token = getCookie(c, 'accessToken')

    if (!token) {
        throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    try {
        const payload = verifyAccessToken(token)
        c.set('user', payload)
    } catch (err) {
        throw new AppError('Invalid or expired token', 'UNAUTHORIZED', 401)
    }

    await next()
}

export const requireRole = (role: string) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user')
        if (!user || user.role !== role) {
            throw new AppError('Forbidden', 'FORBIDDEN', 403)
        }
        await next()
    }
}
