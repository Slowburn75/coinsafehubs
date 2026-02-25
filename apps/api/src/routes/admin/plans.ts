import { adminPlansContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { AppError } from '../../utils/errors'
import { AuditService } from '../../lib/auditService'

export const plansRouter = implement(adminPlansContract).router({
    list: implement(adminPlansContract.list).handler(async () => {
        const plans = await prisma.investmentPlan.findMany({
            orderBy: { displayOrder: 'asc' }
        })
        return { plans: plans as any }
    }),

    create: implement(adminPlansContract.create).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const plan = await prisma.investmentPlan.create({
            data: input as any
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'CREATE_PLAN',
            entity: 'investment_plan',
            entityId: plan.id,
            after: plan
        })

        return { plan: plan as any }
    }),

    update: implement(adminPlansContract.update).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const oldPlan = await prisma.investmentPlan.findUnique({ where: { id: input.id } })
        if (!oldPlan) throw new AppError('Plan not found', 'NOT_FOUND', 404)

        const plan = await prisma.investmentPlan.update({
            where: { id: input.id },
            data: input.data as any
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'UPDATE_PLAN',
            entity: 'investment_plan',
            entityId: plan.id,
            before: oldPlan,
            after: plan
        })

        return { plan: plan as any }
    }),

    toggleActive: implement(adminPlansContract.toggleActive).handler(async ({ input, context }) => {
        const admin = (context as any).user

        await prisma.investmentPlan.update({
            where: { id: input.id },
            data: { isActive: input.active }
        })

        await AuditService.log({
            adminId: admin.id,
            action: input.active ? 'ACTIVATE_PLAN' : 'DEACTIVATE_PLAN',
            entity: 'investment_plan',
            entityId: input.id
        })

        return { success: true }
    }),

    delete: implement(adminPlansContract.delete).handler(async ({ input, context }) => {
        const admin = (context as any).user

        const activeInvestmentsCount = await prisma.investment.count({
            where: { planId: input.id, status: 'ACTIVE' }
        })

        if (activeInvestmentsCount > 0) {
            throw new AppError('Cannot delete plan with active investments', 'BAD_REQUEST', 400)
        }

        await prisma.investmentPlan.delete({
            where: { id: input.id }
        })

        await AuditService.log({
            adminId: admin.id,
            action: 'DELETE_PLAN',
            entity: 'investment_plan',
            entityId: input.id
        })

        return { success: true }
    })
})
