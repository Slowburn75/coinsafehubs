import * as jwt from 'jsonwebtoken'
import { env } from '../utils/env'

type AccessTokenPayload = { id: string; email: string; role: string }
type RefreshTokenPayload = { id: string }

export const signAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'],
  })
}

export const signRefreshToken = (payload: RefreshTokenPayload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as jwt.Secret, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` as jwt.SignOptions['expiresIn'],
  })
}

export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_SECRET as jwt.Secret)

export const verifyRefreshToken = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET as jwt.Secret)
