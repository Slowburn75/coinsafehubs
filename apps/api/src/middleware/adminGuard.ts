import { os } from '@orpc/server'
import { getCookie } from 'hono/cookie'
import { verifyAccessToken } from '../lib/jwt'
import { AppError } from '../utils/errors'
import { Role } from '@repo/db'

/**
 * Standard oRPC middleware: verifies JWT and Role === ADMIN.
 */
export const adminGuard = os.middleware(async ({ next, context }) => {
    const c = (context as any).c
    if (!c) throw new Error('Hono context missing from oRPC context')

    const token = getCookie(c, 'accessToken')

    if (!token) {
        throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    try {
        const payload = verifyAccessToken(token) as any

        if (payload.role !== Role.ADMIN) {
            throw new AppError('Forbidden: Admin access required', 'FORBIDDEN', 403)
        }

        return next({
            context: {
                user: payload
            }
        })
    } catch (err) {
        if (err instanceof AppError) throw err
        throw new AppError('Invalid or expired token', 'UNAUTHORIZED', 401)
    }
})

/**
 * Rate limiter middleware placeholder for oRPC. 
 */
export const adminMutationRateLimit = os.middleware(async ({ next }) => {
    return next({})
})
