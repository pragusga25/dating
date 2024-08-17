import { HttpError } from '../../__shared__/errors'

export class UserAlreadyPremiumError extends HttpError {
  constructor() {
    super(400, 'premium-package/user-already-premium')
  }
}

export class UserAlreadyVerifiedError extends HttpError {
  constructor() {
    super(400, 'premium-package/user-already-verified')
  }
}

export class PremiumPackageNotFoundError extends HttpError {
  constructor() {
    super(404, 'premium-package/not-found')
  }
}

export class PremiumPackageAlreadyPurchasedError extends HttpError {
  constructor() {
    super(400, 'premium-package/already-purchased')
  }
}
