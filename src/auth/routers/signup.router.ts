import { type Request, type Response, Router } from 'express'

import {
  asyncErrorHandler,
  validationBodyMiddleware,
} from '../../__shared__/middlewares'
import { context } from '../../context'
import { SignupSchema } from '../dtos/signup.dto'
import { signupService } from '../services/signup.service'

export const signupRouter = Router()
signupRouter.post(
  '/auth/signup',
  validationBodyMiddleware(SignupSchema),
  asyncErrorHandler(async (req: Request, res: Response) => {
    const signupDto = req.body
    const user = await signupService(context, signupDto)

    res.status(201).json({ result: user, ok: true })
  }),
)
