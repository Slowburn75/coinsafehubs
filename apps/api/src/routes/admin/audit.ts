import { adminAuditContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { CSVExport } from '../../lib/csvExport'

export const auditRouter = implement(adminAuditContract).router({
    list: implement(adminAuditContract.list).handler(async ({ input }) => {
        const { page, limit } = input
        const skip = (page - 1) * limit

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true } } }
            }),
            prisma.auditLog.count()
        ])

        return {
            data: logs as any,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    }),

    export: implement(adminAuditContract.export).handler(async () => {
        const logs = await prisma.auditLog.findMany()
        const csv = CSVExport.formatAuditLogs(logs)
        return { csv }
    })
})
