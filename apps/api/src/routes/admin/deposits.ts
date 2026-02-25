import { adminDepositsContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { AppError } from '../../utils/errors'
import { BalanceService } from '../../lib/balanceService'
import { AuditService } from '../../lib/auditService'
import { TransactionSource, TransactionStatus, TransactionType } from '@repo/db'

export const depositsRouter = implement(adminDepositsContract).router({
    list: implement(adminDepositsContract.list).handler(async ({ input }) => {
        const { page, limit, status } = input
        const skip = (page - 1) * limit

        const where = {
            type: TransactionType.DEPOSIT,
            ...(status && { status }),
        }

        const [deposits, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true } } }
            }),
            prisma.transaction.count({ where })
        ])

        return {
            data: deposits as any,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    }),

    approve: implement(adminDepositsContract.approve).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const txRecord = await prisma.transaction.findUnique({
            where: { id: input.transactionId }
        })

        if (!txRecord || txRecord.status !== TransactionStatus.PENDING) {
            throw new AppError('Transaction not found or not pending', 'NOT_FOUND', 404)
        }

        await BalanceService.credit({
            userId: txRecord.userId,
            amount: txRecord.amount,
            type: TransactionType.DEPOSIT,
            source: TransactionSource.USER,
            reference: txRecord.reference,
            adminNote: `Approved by admin ${admin.id}`,
        })

        await prisma.transaction.update({
            where: { id: input.transactionId },
            data: { status: TransactionStatus.COMPLETED }
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'APPROVE_DEPOSIT',
            entity: 'transaction',
            entityId: input.transactionId,
            after: { status: TransactionStatus.COMPLETED }
        })

        return { success: true }
    }),

    reject: implement(adminDepositsContract.reject).handler(async ({ input, context }) => {
        const admin = (context as any).user

        await prisma.transaction.update({
            where: { id: input.transactionId, status: TransactionStatus.PENDING },
            data: {
                status: TransactionStatus.REJECTED,
                adminNote: input.reason
            }
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'REJECT_DEPOSIT',
            entity: 'transaction',
            entityId: input.transactionId,
            metadata: { reason: input.reason }
        })

        return { success: true }
    }),

    manual: implement(adminDepositsContract.manual).handler(async ({ input, context }) => {
        const admin = (context as any).user

        await BalanceService.credit({
            userId: input.userId,
            amount: input.amount,
            type: TransactionType.DEPOSIT,
            source: TransactionSource.ADMIN_OVERRIDE,
            adminNote: `Manual deposit: ${input.reason}`,
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'MANUAL_DEPOSIT',
            entity: 'user',
            entityId: input.userId,
            metadata: { amount: input.amount, reason: input.reason }
        })

        return { success: true }
    }),

    bulkApprove: implement(adminDepositsContract.bulkApprove).handler(async ({ input, context }) => {
        const admin = (context as any).user
        let successCount = 0

        for (const tid of input.transactionIds) {
            try {
                const txRecord = await prisma.transaction.findUnique({ where: { id: tid } })
                if (txRecord && txRecord.status === TransactionStatus.PENDING) {
                    await BalanceService.credit({
                        userId: txRecord.userId,
                        amount: txRecord.amount,
                        type: TransactionType.DEPOSIT,
                        source: TransactionSource.USER,
                        reference: txRecord.reference,
                    })
                    await prisma.transaction.update({
                        where: { id: tid },
                        data: { status: TransactionStatus.COMPLETED }
                    })
                    successCount++
                }
            } catch (err) {
                // Ignore
            }
        }

        await AuditService.log({
            adminId: admin.id,
            action: 'BULK_APPROVE_DEPOSITS',
            entity: 'transaction',
            metadata: { count: input.transactionIds.length, successCount }
        })

        return { successCount }
    })
})
