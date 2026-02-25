import { supportContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { AppError } from '../utils/errors'

export const supportRouter = implement(supportContract).router({
    createTicket: implement(supportContract.createTicket).handler(async ({ input, context }) => {
        const user = (context as any)?.user
        if (!user) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        await prisma.supportTicket.create({
            data: {
                userId: user.id,
                subject: input.subject,
                message: input.message,
            }
        })
        return { success: true }
    }),

    listTickets: implement(supportContract.listTickets).handler(async ({ context }) => {
        const user = (context as any)?.user
        if (!user) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        const tickets = await prisma.supportTicket.findMany({
            where: user.role === 'ADMIN' ? undefined : { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })
        return { tickets }
    }),

    updateTicket: implement(supportContract.updateTicket).handler(async ({ input, context }) => {
        const user = (context as any)?.user
        if (!user || user.role !== 'ADMIN') throw new AppError('Forbidden', 'FORBIDDEN', 403)

        await prisma.supportTicket.update({
            where: { id: input.ticketId },
            data: { status: input.status }
        })
        return { success: true }
    })
})
