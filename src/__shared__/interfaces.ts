import type { Request } from 'express'

export interface IJwtPayload {
  id: string
  email: string
}

export interface IAuthRequest extends Request {
  user?: IJwtPayload
}

export interface IHttpErrorResponse {
  ok: false
  error: {
    code: string
    details?: string[]
  }
}
