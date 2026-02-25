import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
    UserSchema,
    InvestmentSchema,
    TransactionSchema,
    InvestmentPlanSchema,
    SupportTicketSchema,
    AuditLogSchema,
    AnnouncementSchema,
    KycStatusSchema,
    RoleSchema,
    TransactionStatusSchema,
    InvestmentStatusSchema,
    TicketStatusSchema,
    TicketPrioritySchema
} from '../schemas';

const PaginationInput = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

const createPaginationOutput = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
    data: z.array(dataSchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
});

export const adminUsersContract = oc.router({
    list: oc.input(PaginationInput.extend({
        role: RoleSchema.optional(),
        kycStatus: KycStatusSchema.optional(),
        isActive: z.boolean().optional(),
    }).strict()).output(createPaginationOutput(UserSchema)),

    getProfile: oc.input(z.object({ id: z.string() }).strict()).output(z.object({
        user: UserSchema,
        investments: z.array(InvestmentSchema),
        transactions: z.array(TransactionSchema),
        tickets: z.array(SupportTicketSchema),
        auditLogs: z.array(AuditLogSchema),
    })),

    editBalance: oc.input(z.object({
        userId: z.string(),
        balances: z.object({
            available: z.number().optional(),
            invested: z.number().optional(),
            earnings: z.number().optional(),
            bonus: z.number().optional(),
            pending: z.number().optional(),
        }),
        reason: z.string(),
    }).strict()).output(z.object({ success: z.boolean() })),

    freeze: oc.input(z.object({ userId: z.string(), freeze: z.boolean() }).strict()).output(z.object({ success: z.boolean() })),

    updateKyc: oc.input(z.object({
        userId: z.string(),
        status: KycStatusSchema,
        adminNote: z.string().optional()
    }).strict()).output(z.object({ success: z.boolean() })),

    updateRole: oc.input(z.object({ userId: z.string(), role: RoleSchema }).strict()).output(z.object({ success: z.boolean() })),

    delete: oc.input(z.object({ userId: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    resetPassword: oc.input(z.object({ userId: z.string() }).strict()).output(z.object({ temporaryPassword: z.string() })),

    export: oc.output(z.object({ csv: z.string() })),
});

export const adminDepositsContract = oc.router({
    list: oc.input(PaginationInput.extend({
        status: TransactionStatusSchema.optional(),
    }).strict()).output(createPaginationOutput(TransactionSchema)),

    approve: oc.input(z.object({ transactionId: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    reject: oc.input(z.object({ transactionId: z.string(), reason: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    manual: oc.input(z.object({
        userId: z.string(),
        amount: z.number(),
        reason: z.string(),
    }).strict()).output(z.object({ success: z.boolean() })),

    bulkApprove: oc.input(z.object({ transactionIds: z.array(z.string()) }).strict()).output(z.object({ successCount: z.number() })),
});

export const adminWithdrawalsContract = oc.router({
    list: oc.input(PaginationInput.extend({
        status: TransactionStatusSchema.optional(),
    }).strict()).output(createPaginationOutput(TransactionSchema)),

    approve: oc.input(z.object({ transactionId: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    reject: oc.input(z.object({ transactionId: z.string(), reason: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    flag: oc.input(z.object({ transactionId: z.string(), note: z.string() }).strict()).output(z.object({ success: z.boolean() })),
});

export const adminPlansContract = oc.router({
    list: oc.output(z.object({ plans: z.array(InvestmentPlanSchema) })),

    create: oc.input(InvestmentPlanSchema.omit({ id: true, createdAt: true, updatedAt: true }).strict()).output(z.object({ plan: InvestmentPlanSchema })),

    update: oc.input(z.object({
        id: z.string(),
        data: InvestmentPlanSchema.partial().omit({ id: true, createdAt: true, updatedAt: true }).strict(),
    }).strict()).output(z.object({ plan: InvestmentPlanSchema })),

    toggleActive: oc.input(z.object({ id: z.string(), active: z.boolean() }).strict()).output(z.object({ success: z.boolean() })),

    delete: oc.input(z.object({ id: z.string() }).strict()).output(z.object({ success: z.boolean() })),
});

export const adminInvestmentsContract = oc.router({
    list: oc.input(PaginationInput.extend({
        status: InvestmentStatusSchema.optional(),
    }).strict()).output(createPaginationOutput(InvestmentSchema)),

    complete: oc.input(z.object({ investmentId: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    cancel: oc.input(z.object({ investmentId: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    pause: oc.input(z.object({ investmentId: z.string(), pause: z.boolean() }).strict()).output(z.object({ success: z.boolean() })),

    adjustRoi: oc.input(z.object({ investmentId: z.string(), newRoi: z.number() }).strict()).output(z.object({ success: z.boolean() })),
});

export const adminTransactionsContract = oc.router({
    list: oc.input(PaginationInput.extend({
        status: TransactionStatusSchema.optional(),
    }).strict()).output(createPaginationOutput(TransactionSchema)),

    updateStatus: oc.input(z.object({ transactionId: z.string(), status: TransactionStatusSchema, reason: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    reverse: oc.input(z.object({ transactionId: z.string() }).strict()).output(z.object({ success: z.boolean() })),
});

export const adminTicketsContract = oc.router({
    list: oc.input(PaginationInput.extend({
        status: TicketStatusSchema.optional(),
        priority: TicketPrioritySchema.optional(),
    }).strict()).output(createPaginationOutput(SupportTicketSchema)),

    reply: oc.input(z.object({ ticketId: z.string(), message: z.string(), isInternal: z.boolean() }).strict()).output(z.object({ success: z.boolean() })),

    updateStatus: oc.input(z.object({ ticketId: z.string(), status: TicketStatusSchema }).strict()).output(z.object({ success: z.boolean() })),

    assign: oc.input(z.object({ ticketId: z.string(), adminId: z.string() }).strict()).output(z.object({ success: z.boolean() })),

    updatePriority: oc.input(z.object({ ticketId: z.string(), priority: TicketPrioritySchema }).strict()).output(z.object({ success: z.boolean() })),
});

export const adminAuditContract = oc.router({
    list: oc.input(PaginationInput.strict()).output(createPaginationOutput(AuditLogSchema)),

    export: oc.output(z.object({ csv: z.string() })),
});

export const adminAnnouncementsContract = oc.router({
    list: oc.output(z.object({ announcements: z.array(AnnouncementSchema) })),

    create: oc.input(AnnouncementSchema.omit({ id: true, createdAt: true, updatedAt: true, createdBy: true }).strict()).output(z.object({ announcement: AnnouncementSchema })),

    update: oc.input(z.object({
        id: z.string(),
        data: AnnouncementSchema.partial().omit({ id: true, createdAt: true, updatedAt: true, createdBy: true }).strict(),
    }).strict()).output(z.object({ announcement: AnnouncementSchema })),

    delete: oc.input(z.object({ id: z.string() }).strict()).output(z.object({ success: z.boolean() })),
});

export const adminContract = oc.router({
    getStats: oc.output(z.object({
        totalUsers: z.number(),
        activeUsers30d: z.number(),
        frozenAccounts: z.number(),
        pendingKycCount: z.number(),
        totalDepositsAllTime: z.number(),
        totalWithdrawalsAllTime: z.number(),
        activeInvestmentVolume: z.number(),
        totalRoiPaidOut: z.number(),
        pendingWithdrawalTotal: z.number(),
        pendingDepositTotal: z.number(),
    })),
    getCharts: oc.output(z.object({
        dailyStats: z.array(z.object({
            date: z.string(),
            deposits: z.number(),
            withdrawals: z.number(),
        })),
        userGrowth: z.array(z.object({
            month: z.string(),
            count: z.number(),
        })),
    })),

    users: adminUsersContract,
    deposits: adminDepositsContract,
    withdrawals: adminWithdrawalsContract,
    plans: adminPlansContract,
    investments: adminInvestmentsContract,
    transactions: adminTransactionsContract,
    support: adminTicketsContract,
    audit: adminAuditContract,
    announcements: adminAnnouncementsContract,
});
