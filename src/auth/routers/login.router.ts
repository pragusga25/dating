import { type Request, type Response, Router } from 'express'

import {
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__shared__/middlewares'
import { context } from '../../context'
import { LoginSchema } from '../dtos/login.dto'
import { loginService } from '../services/login.service'

export const loginRouter = Router()
loginRouter.post(
  '/auth/login',
  validationBodyMiddleware(LoginSchema),
  asyncErrorHandler(async (req: Request, res: Response) => {
    const loginDto = req.body
    const user = await loginService(context, loginDto)

    res.status(200).json({ result: user, ok: true })
  }),
)
