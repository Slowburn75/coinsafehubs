import * as jwt from 'jsonwebtoken'
import { env } from '../utils/env'

export const signAccessToken = (payload: any) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' })
}

export const signRefreshToken = (payload: any) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
}

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, env.JWT_SECRET)
}
