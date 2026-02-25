import { Context, Next } from 'hono'
import { prisma } from '@repo/db'

export const auditLog = async (c: Context, next: Next) => {
    await next()

    // Post-request, non-blocking log
    const user = c.get('user')
    const req = c.req

    // Example simplistic audit log mechanism
    if (req.method !== 'GET') {
        prisma.auditLog.create({
            data: {
                userId: user?.id,
                action: `${req.method} ${req.path}`,
                entity: req.path.split('/')[1] || 'Unknown',
                ipAddress: req.header('x-forwarded-for') || 'Unknown',
                userAgent: req.header('user-agent'),
            }
        }).catch(console.error)
    }
}
