import { Context, Next } from 'hono'
import { RateLimitError } from '../utils/errors'

const store = new Map<string, { count: number; resetTime: number }>()

const createLimiter = (max: number, windowMs: number) => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()
    const record = store.get(key)

    if (record && record.resetTime > now) {
      if (record.count >= max) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000)
        c.header('Retry-After', retryAfter.toString())
        throw new RateLimitError(`Too many requests. Try again in ${retryAfter} seconds.`, retryAfter)
      }
      record.count += 1
      store.set(key, record)
    } else {
      store.set(key, { count: 1, resetTime: now + windowMs })
    }

    await next()
  }
}

export const globalRateLimit = createLimiter(300, 15 * 60 * 1000)
export const authRateLimit = createLimiter(20, 15 * 60 * 1000)
