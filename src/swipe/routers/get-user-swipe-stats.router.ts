import { type Response, Router } from 'express'

import type { IAuthRequest } from '../../__shared__/interfaces'
import { asyncErrorHandler, auth } from '../../__shared__/middlewares'
import { context } from '../../context'
import { getUserSwipeStatsService } from '../services/get-user-swipe-stats.service'

export const getUserSwipeStatsRouter = Router()
getUserSwipeStatsRouter.get(
  '/swipes/stats',
  auth,
  asyncErrorHandler(async (req: IAuthRequest, res: Response) => {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const stats = await getUserSwipeStatsService(context, req.user!.id)

    res.status(200).json({ result: stats, ok: true })
  }),
)
