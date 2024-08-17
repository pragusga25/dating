import { HttpError } from '../../__shared__/errors'

export class DailySwipeLimitReachedError extends HttpError {
  constructor() {
    super(403, 'swipe/daily-swipe-limit-reached')
  }
}

export class SwipeProfileNotFoundError extends HttpError {
  constructor() {
    super(404, 'swipe/profile-not-found')
  }
}

export class SwipeNotFoundError extends HttpError {
  constructor() {
    super(404, 'swipe/not-found')
  }
}
