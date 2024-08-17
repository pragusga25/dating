import { type Response, Router } from 'express'

import type { IAuthRequest } from '../../__shared__/interfaces'
import { asyncErrorHandler, auth } from '../../__shared__/middlewares'
import { context } from '../../context'
import { meService } from '../services/me.service'

export const meRouter = Router()
meRouter.get(
  '/auth/me',
  auth,
  asyncErrorHandler(async (req: IAuthRequest, res: Response) => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const user = await meService(context, req.user!.id)

    res.status(200).json({ result: user, ok: true })
  }),
)
