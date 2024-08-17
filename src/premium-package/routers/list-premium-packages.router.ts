import { type Request, type Response, Router } from 'express'

import { asyncErrorHandler } from '../../__shared__/middlewares'
import { context } from '../../context'
import { listPremiumPackagesService } from '../services/list-premium-packages.service'

export const listPremiumPackagesRouter = Router()
listPremiumPackagesRouter.get(
  '/premium-packages',
  asyncErrorHandler(async (_req: Request, res: Response) => {
    const pckgs = await listPremiumPackagesService(context)

    res.status(200).json({ result: pckgs, ok: true })
  }),
)
