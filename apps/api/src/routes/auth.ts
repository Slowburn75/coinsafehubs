import { authContract } from '@repo/types'
import { implement } from '@orpc/server'
import { prisma } from '@repo/db'
import { hashPassword, comparePassword } from '../lib/bcrypt'
import { signAccessToken, signRefreshToken } from '../lib/jwt'
import { AppError } from '../utils/errors'
import { deleteCookie } from 'hono/cookie'

export const authRouter = implement(authContract).router({
    login: implement(authContract.login).handler(async ({ input, context }) => {
        const { email, password } = input

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            throw new AppError('Invalid credentials', 'AUTH_INVALID_CREDENTIALS', 400)
        }

        const isValid = await comparePassword(password, user.password)
        if (!isValid) {
            throw new AppError('Invalid credentials', 'AUTH_INVALID_CREDENTIALS', 400)
        }

        const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role })
        const refreshToken = signRefreshToken({ id: user.id })

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                kycStatus: user.kycStatus,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        }
    }),

    register: implement(authContract.register).handler(async ({ input }) => {
        const { email, password } = input

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            throw new AppError('Email already in use', 'AUTH_EMAIL_EXISTS', 400)
        }

        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            }
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                kycStatus: user.kycStatus,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        }
    }),

    me: implement(authContract.me).handler(async ({ context }) => {
        const payload = (context as any)?.user
        if (!payload) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        const user = await prisma.user.findUnique({ where: { id: payload.id } })
        if (!user) throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                kycStatus: user.kycStatus,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        }
    }),

    logout: implement(authContract.logout).handler(async ({ context }) => {
        const c = (context as any).c
        if (c) {
            deleteCookie(c, 'accessToken')
            deleteCookie(c, 'refreshToken')
        }
        return { success: true }
    })
})
