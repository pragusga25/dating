import { getSwipeableProfileRouter } from './get-swipeable-profile.router'
import { getUserSwipeStatsRouter } from './get-user-swipe-stats.router'
import { updateSwipeActionRouter } from './update-swipe-action.router'

export const swipeRouters = [
  getSwipeableProfileRouter,
  getUserSwipeStatsRouter,
  updateSwipeActionRouter,
]
