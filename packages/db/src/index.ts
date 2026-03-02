import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export {
  Prisma,
  Role,
  KycStatus,
  InvestmentStatus,
  TransactionType,
  TransactionStatus,
  TransactionSource,
  TicketStatus,
  TicketPriority,
  RiskLevel,
  AnnouncementType,
} from '@prisma/client'

export * from '@prisma/client'
