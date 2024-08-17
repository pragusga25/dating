import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { ZodError, type ZodSchema } from 'zod'
import { HttpError, MissingAccessTokenError } from '../__shared__/errors'
import type { IAuthRequest } from './interfaces'
import { verifyAccessToken } from './utils'

export const auth = (req: IAuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    throw new MissingAccessTokenError()
  }

  const result = verifyAccessToken(token)

  req.user = {
    id: result.id,
    email: result.email,
  }
  next()
}

type Args = 'body' | 'params' | 'query'

const validationMiddleware =
  (args: Args) =>
  (schema: ZodSchema): RequestHandler => {
    return (req, _res, next) => {
      try {
        const data = req[args]
        const validatedData = schema.parse(data)
        req[args] = validatedData
        next()
      } catch (error) {
        if (error instanceof ZodError) {
          const messages = error.errors.map((err) => err.message)
          next(new HttpError(400, `request/invalid-${args}`, messages))
        } else {
          next(
            new HttpError(400, `request/invalid-${args}`, ['Invalid request']),
          )
        }
      }
    }
  }

export const validationBodyMiddleware = validationMiddleware('body')
export const validationQueryMiddleware = validationMiddleware('query')
export const validationParamsMiddleware = validationMiddleware('params')
export const errorMiddleware = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err.status || 500

  const response = err.response ?? {
    ok: false,
    error: {
      code: 'internal-server-error',
      details: [err.name, err.message],
    },
  }

  res.status(status).send(response)
}

export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => unknown,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
