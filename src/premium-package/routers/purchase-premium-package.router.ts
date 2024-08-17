import { type Response, Router } from 'express'

import type { IAuthRequest } from '../../__shared__/interfaces'
import {
  asyncErrorHandler,
  auth,
  validationBodyMiddleware,
} from '../../__shared__/middlewares'
import { context } from '../../context'

import { PurchasePremiumPackageSchema } from '../dtos'
import { purchasePremiumPackageService } from '../services/purchase-premium-package.service'

export const purchasePremiumPackageRouter = Router()
purchasePremiumPackageRouter.post(
  '/premium-packages/purchase',
  validationBodyMiddleware(PurchasePremiumPackageSchema),
  auth,
  asyncErrorHandler(async (req: IAuthRequest, res: Response) => {
    const purchase = await purchasePremiumPackageService(
      context,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      req.user!.id,
      req.body,
    )

    res.status(201).json({ result: purchase })
  }),
)
