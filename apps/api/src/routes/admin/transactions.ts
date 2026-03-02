import { adminTransactionsContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma, Prisma, TransactionSource, TransactionStatus, TransactionType } from '@repo/db'
import { AppError } from '../../utils/errors'
import { AuditService } from '../../lib/auditService'

export const transactionsRouter = implement(adminTransactionsContract).router({
  list: implement(adminTransactionsContract.list).handler(async ({ input }) => {
    const { page, limit, status } = input
    const skip = (page - 1) * limit

    const where = { ...(status && { status }) }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      prisma.transaction.count({ where }),
    ])

    return { data: transactions as any, page, limit, total, totalPages: Math.ceil(total / limit) }
  }),

  updateStatus: implement(adminTransactionsContract.updateStatus).handler(async ({ input, context }) => {
    const admin = (context as any).user

    if (input.status !== 'COMPLETED' && input.status !== 'REJECTED') {
      throw new AppError('Only COMPLETED or REJECTED transitions are allowed.', 'VALIDATION_ERROR', 400)
    }

    const transaction = await prisma.transaction.findUnique({ where: { id: input.transactionId } })
    if (!transaction) throw new AppError('Transaction not found.', 'NOT_FOUND', 404)
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new AppError('This transaction is already finalized.', 'TRANSACTION_ALREADY_FINALIZED', 409)
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.updateMany({
        where: { id: input.transactionId, status: TransactionStatus.PENDING },
        data: {
          status: input.status,
          source: TransactionSource.ADMIN_OVERRIDE,
          adminNote: input.reason,
        },
      })

      if (updated.count !== 1) {
        throw new AppError('Transaction approval was already processed by another request.', 'TRANSACTION_RACE_CONDITION', 409)
      }

      const amount = new Prisma.Decimal(transaction.amount)

      if (transaction.type === TransactionType.DEPOSIT && input.status === TransactionStatus.COMPLETED) {
        await tx.userBalance.upsert({
          where: { userId: transaction.userId },
          create: { userId: transaction.userId, available: amount },
          update: { available: { increment: amount } },
        })
      }

      if (transaction.type === TransactionType.WITHDRAWAL) {
        if (input.status === TransactionStatus.COMPLETED) {
          await tx.userBalance.update({
            where: { userId: transaction.userId },
            data: { pending: { decrement: amount } },
          })
        } else {
          await tx.userBalance.update({
            where: { userId: transaction.userId },
            data: { pending: { decrement: amount }, available: { increment: amount } },
          })
        }
      }
    })

    await AuditService.log({
      adminId: admin.id,
      action: input.status === 'COMPLETED' ? 'APPROVE_TRANSACTION' : 'REJECT_TRANSACTION',
      entity: 'transaction',
      entityId: transaction.id,
      metadata: { reason: input.reason },
    })

    return { success: true }
  }),

  reverse: implement(adminTransactionsContract.reverse).handler(async ({ input, context }) => {
    const admin = (context as any).user
    const originalTx = await prisma.transaction.findUnique({ where: { id: input.transactionId } })

    if (!originalTx || originalTx.status !== TransactionStatus.COMPLETED) {
      throw new AppError('Only completed transactions can be reversed.', 'BAD_REQUEST', 400)
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId: originalTx.userId,
          type: originalTx.type === TransactionType.DEPOSIT ? TransactionType.WITHDRAWAL : TransactionType.DEPOSIT,
          amount: originalTx.amount,
          status: TransactionStatus.COMPLETED,
          source: TransactionSource.REVERSAL,
          adminNote: `Reversal of ${originalTx.id}`,
        },
      })

      if (originalTx.type === TransactionType.DEPOSIT) {
        await tx.userBalance.update({ where: { userId: originalTx.userId }, data: { available: { decrement: originalTx.amount } } })
      } else {
        await tx.userBalance.update({ where: { userId: originalTx.userId }, data: { available: { increment: originalTx.amount } } })
      }
    })

    await AuditService.log({ adminId: admin.id, action: 'REVERSE_TRANSACTION', entity: 'transaction', entityId: input.transactionId })

    return { success: true }
  }),
})
