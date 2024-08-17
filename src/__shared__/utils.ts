import { TokenExpiredError as Tex, sign, verify } from 'jsonwebtoken'
import { envVars } from './config'
import { AccessTokenExpiredError, AccessTokenInvalidError } from './errors'
import type { IJwtPayload } from './interfaces'

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const generateAccessToken = (payload: IJwtPayload) =>
  sign(payload, envVars.JWT_SECRET, {
    expiresIn: envVars.JWT_EXPIRATION,
  })

export const verifyAccessToken = (token: string) => {
  try {
    return verify(token, envVars.JWT_SECRET) as IJwtPayload
  } catch (error) {
    if (error instanceof Tex) {
      throw new AccessTokenExpiredError()
    }

    console.log(token)
    console.error(error)

    throw new AccessTokenInvalidError()
  }
}
