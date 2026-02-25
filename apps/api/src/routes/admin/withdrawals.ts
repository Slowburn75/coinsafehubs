import { adminWithdrawalsContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { AppError } from '../../utils/errors'
import { BalanceService } from '../../lib/balanceService'
import { AuditService } from '../../lib/auditService'
import { TransactionSource, TransactionStatus, TransactionType } from '@repo/db'

export const withdrawalsRouter = implement(adminWithdrawalsContract).router({
    list: implement(adminWithdrawalsContract.list).handler(async ({ input }) => {
        const { page, limit, status } = input
        const skip = (page - 1) * limit

        const where = {
            type: TransactionType.WITHDRAWAL,
            ...(status && { status }),
        }

        const [withdrawals, total] = await Promise.all([
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
            data: withdrawals as any,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    }),

    approve: implement(adminWithdrawalsContract.approve).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const txRecord = await prisma.transaction.findUnique({
            where: { id: input.transactionId }
        })

        if (!txRecord || txRecord.status !== TransactionStatus.PENDING) {
            throw new AppError('Transaction not found or not pending', 'NOT_FOUND', 404)
        }

        await BalanceService.debit({
            userId: txRecord.userId,
            amount: txRecord.amount,
            type: TransactionType.WITHDRAWAL,
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
            action: 'APPROVE_WITHDRAWAL',
            entity: 'transaction',
            entityId: input.transactionId,
            after: { status: TransactionStatus.COMPLETED }
        })

        return { success: true }
    }),

    reject: implement(adminWithdrawalsContract.reject).handler(async ({ input, context }) => {
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
            action: 'REJECT_WITHDRAWAL',
            entity: 'transaction',
            entityId: input.transactionId,
            metadata: { reason: input.reason }
        })

        return { success: true }
    }),

    flag: implement(adminWithdrawalsContract.flag).handler(async ({ input, context }) => {
        const admin = (context as any).user

        await prisma.transaction.update({
            where: { id: input.transactionId },
            data: {
                flagged: true,
                adminNote: input.note
            }
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'FLAG_WITHDRAWAL',
            entity: 'transaction',
            entityId: input.transactionId,
            metadata: { note: input.note }
        })

        return { success: true }
    })
})
