import { listPremiumPackagesRouter } from './list-premium-packages.router'
import { purchasePremiumPackageRouter } from './purchase-premium-package.router'

export const premiumPackageRouters = [
  purchasePremiumPackageRouter,
  listPremiumPackagesRouter,
]
