import { z } from 'zod';

export const RoleSchema = z.enum(['USER', 'ADMIN']);
export const KycStatusSchema = z.enum(['PENDING', 'VERIFIED', 'REJECTED']);
export const InvestmentStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']);
export const TransactionTypeSchema = z.enum(['DEPOSIT', 'WITHDRAWAL', 'INTEREST']);
export const TransactionStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED']);
export const TransactionSourceSchema = z.enum(['USER', 'ADMIN_OVERRIDE', 'SYSTEM', 'REVERSAL']);
export const TicketStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export const TicketPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const RiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const AnnouncementTypeSchema = z.enum(['INFO', 'WARNING', 'MAINTENANCE', 'PROMOTION']);

export const UserBalanceSchema = z.object({
    id: z.string(),
    userId: z.string(),
    available: z.union([z.number(), z.string()]),
    invested: z.union([z.number(), z.string()]),
    earnings: z.union([z.number(), z.string()]),
    bonus: z.union([z.number(), z.string()]),
    pending: z.union([z.number(), z.string()]),
    updatedAt: z.date(),
});

export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    role: RoleSchema,
    kycStatus: KycStatusSchema,
    isActive: z.boolean(),
    createdAt: z.date(),
    balance: UserBalanceSchema.optional(),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const RegisterSchema = LoginSchema;

export const InvestmentPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    minimumAmount: z.union([z.number(), z.string()]),
    maximumAmount: z.union([z.number(), z.string()]),
    roiPercent: z.union([z.number(), z.string()]),
    durationDays: z.number(),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    isArchived: z.boolean(),
    riskLevel: RiskLevelSchema,
    displayOrder: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const InvestmentSchema = z.object({
    id: z.string(),
    userId: z.string(),
    planId: z.string(),
    plan: InvestmentPlanSchema.optional(),
    amount: z.union([z.number(), z.string()]),
    status: InvestmentStatusSchema,
    roi: z.union([z.number(), z.string()]),
    isPaused: z.boolean(),
    adminNote: z.string().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const TransactionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    type: TransactionTypeSchema,
    amount: z.union([z.number(), z.string()]),
    status: TransactionStatusSchema,
    reference: z.string(),
    source: TransactionSourceSchema,
    flagged: z.boolean(),
    adminNote: z.string().nullable().optional(),
    metadata: z.any().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const TicketReplySchema = z.object({
    id: z.string(),
    ticketId: z.string(),
    authorId: z.string(),
    message: z.string(),
    isInternal: z.boolean(),
    createdAt: z.date(),
});

export const SupportTicketSchema = z.object({
    id: z.string(),
    userId: z.string(),
    subject: z.string(),
    message: z.string(),
    status: TicketStatusSchema,
    priority: TicketPrioritySchema,
    assignedTo: z.string().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    replies: z.array(TicketReplySchema).optional(),
});

export const AdminNoteSchema = z.object({
    id: z.string(),
    adminId: z.string(),
    targetType: z.string(),
    targetId: z.string(),
    note: z.string(),
    isInternal: z.boolean(),
    createdAt: z.date(),
});

export const AnnouncementSchema = z.object({
    id: z.string(),
    title: z.string(),
    body: z.string(),
    type: AnnouncementTypeSchema,
    isActive: z.boolean(),
    targetAll: z.boolean(),
    expiresAt: z.date().nullable().optional(),
    createdBy: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const AuditLogSchema = z.object({
    id: z.string(),
    userId: z.string().nullable().optional(),
    action: z.string(),
    entity: z.string(),
    entityId: z.string().nullable().optional(),
    metadata: z.any().optional(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
    createdAt: z.date(),
});
