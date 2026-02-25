import { prisma, Prisma } from '@repo/db'

export class AuditService {
    /**
     * Logs an admin action with before/after snapshots.
     */
    static async log(params: {
        adminId: string
        action: string
        entity: string
        entityId?: string
        before?: any
        after?: any
        metadata?: any
        ipAddress?: string
        userAgent?: string
    }) {
        // Structured metadata for snapshots
        const logMetadata: any = {
            ...(params.before && { before: params.before }),
            ...(params.after && { after: params.after }),
            ...(params.metadata && { ...params.metadata }),
        }

        return await prisma.auditLog.create({
            data: {
                userId: params.adminId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                metadata: logMetadata as Prisma.JsonObject,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            }
        })
    }

    /**
     * Convenience wrapper for capturing snapshots automatically if needed, 
     * or could be expanded with more advanced diffing logic.
     */
}
