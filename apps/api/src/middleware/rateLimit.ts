import { Context, Next } from 'hono'
import { AppError } from '../utils/errors'

// Simplified memory-based rate limiting for demonstration.
// In production, redis should be used here.

const store = new Map<string, { count: number, resetTime: number }>()

const createLimiter = (max: number, windowMs: number) => {
    return async (c: Context, next: Next) => {
        const ip = c.req.header('x-forwarded-for') || '127.0.0.1'

        // Simplistic memory check
        const now = Date.now()
        const record = store.get(ip)

        if (record && record.resetTime > now) {
            if (record.count >= max) {
                throw new AppError('Too many requests', 'RATE_LIMIT_EXCEEDED', 429)
            }
            record.count++
        } else {
            store.set(ip, { count: 1, resetTime: now + windowMs })
        }

        await next()
    }
}

export const globalRateLimit = createLimiter(100, 15 * 60 * 1000)
export const authRateLimit = createLimiter(5, 15 * 60 * 1000)
