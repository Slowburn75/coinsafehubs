import { PrismaClient, Role, KycStatus, InvestmentStatus, TransactionType, TransactionStatus, RiskLevel, TransactionSource, TicketPriority } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.VrZiPTUn.Iq1mXxe" // 'password123'

    // 1. Create Investment Plans
    const starterPlan = await prisma.investmentPlan.upsert({
        where: { id: 'plan-starter' },
        update: {},
        create: {
            id: 'plan-starter',
            name: 'Starter Plan',
            description: 'Perfect for beginners starting their investment journey.',
            minimumAmount: 100,
            maximumAmount: 1000,
            roiPercent: 5.5,
            durationDays: 30,
            riskLevel: RiskLevel.LOW,
            displayOrder: 1,
        }
    })

    const growthPlan = await prisma.investmentPlan.upsert({
        where: { id: 'plan-growth' },
        update: {},
        create: {
            id: 'plan-growth',
            name: 'Growth Plan',
            description: 'Higher returns for experienced investors.',
            minimumAmount: 1001,
            maximumAmount: 5000,
            roiPercent: 12.0,
            durationDays: 90,
            riskLevel: RiskLevel.MEDIUM,
            displayOrder: 2,
        }
    })

    // 2. Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@coinsafehub.com' },
        update: {},
        create: {
            email: 'admin@coinsafehub.com',
            password: passwordHash,
            role: Role.ADMIN,
            kycStatus: KycStatus.VERIFIED,
            balance: {
                create: {
                    available: 0,
                    invested: 0,
                    earnings: 0,
                }
            }
        },
    })

    // 3. Create Users
    const user1 = await prisma.user.upsert({
        where: { email: 'user1@example.com' },
        update: {},
        create: {
            email: 'user1@example.com',
            password: passwordHash,
            role: Role.USER,
            kycStatus: KycStatus.VERIFIED,
            balance: {
                create: {
                    available: 1000,
                    invested: 5000,
                    earnings: 275,
                }
            },
            investments: {
                create: [
                    {
                        amount: 5000,
                        planId: starterPlan.id,
                        roi: 5.5,
                        status: InvestmentStatus.ACTIVE,
                    }
                ]
            },
            transactions: {
                create: [
                    {
                        type: TransactionType.DEPOSIT,
                        amount: 5000,
                        status: TransactionStatus.COMPLETED,
                        source: TransactionSource.USER,
                    }
                ]
            }
        },
    })

    // 4. Create Support Tickets
    await prisma.supportTicket.create({
        data: {
            userId: user1.id,
            subject: 'Withdrawal Delay',
            message: 'My withdrawal is still pending after 24 hours. Can you check?',
            status: 'OPEN',
            priority: TicketPriority.HIGH,
            replies: {
                create: {
                    authorId: admin.id,
                    message: 'We are looking into this for you.',
                    isInternal: false,
                }
            }
        }
    })

    // 5. Create Announcements
    await prisma.announcement.create({
        data: {
            title: 'System Maintenance',
            body: 'Scheduled maintenance this Sunday at 02:00 UTC.',
            type: 'MAINTENANCE',
            createdBy: admin.id,
            targetAll: true,
        }
    })

    console.log('Seeding complete.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
