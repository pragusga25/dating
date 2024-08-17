import { Action } from '@prisma/client'
import type { Context } from '../../context'

export const getUserSwipeStatsService = async (
  ctx: Context,
  currentUserId: string,
) => {
  const swipes = await ctx.prisma.swipe.findMany({
    where: {
      userId: currentUserId,
    },
    select: {
      swiped: {
        select: {
          id: true,
          name: true,
          email: true,
          gender: true,
          bio: true,
          isVerified: true,
          dateOfBirth: true,
          profilePicture: true,
        },
      },
      id: true,
      action: true,
      createdAt: true,
    },
  })

  const totalSwipes = swipes.length
  const totalLikes = swipes.filter(
    (swipe) => swipe.action === Action.LIKE,
  ).length
  const totalPasses = swipes.filter(
    (swipe) => swipe.action === Action.PASS,
  ).length
  const swipedToday = swipes.filter((swipe) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return swipe.createdAt >= today
  })
  const totalSwipesToday = swipedToday.length

  return {
    totalSwipes,
    totalLikes,
    totalPasses,
    totalSwipesToday,
    swipedToday,
  }
}
