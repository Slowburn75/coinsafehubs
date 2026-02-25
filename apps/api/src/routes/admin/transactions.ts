import { adminTransactionsContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { AppError } from '../../utils/errors'
import { AuditService } from '../../lib/auditService'
import { TransactionSource, TransactionStatus, TransactionType } from '@repo/db'

export const transactionsRouter = implement(adminTransactionsContract).router({
    list: implement(adminTransactionsContract.list).handler(async ({ input }) => {
        const { page, limit, status } = input
        const skip = (page - 1) * limit

        const where = {
            ...(status && { status }),
        }

        const [transactions, total] = await Promise.all([
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
            data: transactions as any,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    }),

    updateStatus: implement(adminTransactionsContract.updateStatus).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const oldTx = await prisma.transaction.findUnique({ where: { id: input.transactionId } })
        if (!oldTx) throw new AppError('Transaction not found', 'NOT_FOUND', 404)

        await prisma.transaction.update({
            where: { id: input.transactionId },
            data: {
                status: input.status,
                adminNote: input.reason
            }
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'UPDATE_TRANSACTION_STATUS',
            entity: 'transaction',
            entityId: input.transactionId,
            before: { status: oldTx.status },
            after: { status: input.status },
        })

        return { success: true }
    }),

    reverse: implement(adminTransactionsContract.reverse).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const originalTx = await prisma.transaction.findUnique({
            where: { id: input.transactionId }
        })

        if (!originalTx || originalTx.status !== TransactionStatus.COMPLETED) {
            throw new AppError('Only completed transactions can be reversed', 'BAD_REQUEST', 400)
        }

        await prisma.$transaction(async (tx) => {
            await tx.transaction.create({
                data: {
                    userId: originalTx.userId,
                    type: originalTx.type === TransactionType.DEPOSIT ? TransactionType.WITHDRAWAL : TransactionType.DEPOSIT,
                    amount: originalTx.amount,
                    status: TransactionStatus.COMPLETED,
                    source: TransactionSource.REVERSAL,
                    adminNote: `Reversal of transaction ${originalTx.id} by admin ${admin.id}`,
                }
            })

            const multiplier = originalTx.type === TransactionType.DEPOSIT ? -1 : 1
            await tx.userBalance.update({
                where: { userId: originalTx.userId },
                data: {
                    available: { increment: originalTx.amount.mul(multiplier) }
                }
            })

            await tx.transaction.update({
                where: { id: input.transactionId },
                data: { adminNote: (originalTx.adminNote || '') + ` | REVERSED by admin ${admin.id}` }
            })
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'REVERSE_TRANSACTION',
            entity: 'transaction',
            entityId: input.transactionId
        })

        return { success: true }
    })
})
