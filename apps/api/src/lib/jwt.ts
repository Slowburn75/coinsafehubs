import * as jwt from 'jsonwebtoken'
import { env } from '../utils/env'

export const signAccessToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL })
}

export const signRefreshToken = (payload: { id: string }) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` })
}

export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_SECRET)

export const verifyRefreshToken = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET)
