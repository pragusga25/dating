import { type Response, Router } from 'express'

import type { IAuthRequest } from '../../__shared__/interfaces'
import {
  asyncErrorHandler,
  auth,
  validationBodyMiddleware,
} from '../../__shared__/middlewares'
import { context } from '../../context'
import { UpdateSwipeActionSchema } from '../dtos/update-swipe-action.dto'
import { updateSwipeActionService } from '../services/update-swipe-action.service'

export const updateSwipeActionRouter = Router()
updateSwipeActionRouter.put(
  '/swipes',
  validationBodyMiddleware(UpdateSwipeActionSchema),
  auth,
  asyncErrorHandler(async (req: IAuthRequest, res: Response) => {
    const profile = await updateSwipeActionService(
      context,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      req.user!.id,
      req.body,
    )

    res.status(200).json({ result: profile, ok: true })
  }),
)
