import { type Response, Router } from 'express'

import type { IAuthRequest } from '../../__shared__/interfaces'
import { asyncErrorHandler, auth } from '../../__shared__/middlewares'
import { context } from '../../context'
import { getSwipeableProfileService } from '../services/get-swipeable-profile.service'

export const getSwipeableProfileRouter = Router()
getSwipeableProfileRouter.get(
  '/swipes/profile',
  auth,
  asyncErrorHandler(async (req: IAuthRequest, res: Response) => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const profile = await getSwipeableProfileService(context, req.user!.id)

    res.status(200).json({ result: profile, ok: true })
  }),
)
