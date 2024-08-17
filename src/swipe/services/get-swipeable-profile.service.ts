import { CurrentUserNotFound } from '../../__shared__/errors'
import type { Context } from '../../context'
import {
  DailySwipeLimitReachedError,
  SwipeProfileNotFoundError,
} from '../errors'

export const getSwipeableProfileService = async (
  ctx: Context,
  currentUserId: string,
) => {
  const currentUser = await ctx.prisma.user.findUnique({
    where: {
      id: currentUserId,
    },
  })

  if (!currentUser) {
    throw new CurrentUserNotFound()
  }

  if (currentUser.dailySwipesCount >= 10 && !currentUser.isPremium) {
    throw new DailySwipeLimitReachedError()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const swipedToday = await ctx.prisma.swipe.findMany({
    where: {
      userId: currentUserId,
      createdAt: { gte: today },
    },
    select: { swipedId: true },
  })

  const swipedIds = swipedToday.map((swipe) => swipe.swipedId)

  const profile = await ctx.prisma.user.findFirst({
    where: {
      id: {
        not: currentUserId,
        notIn: swipedIds,
      },
    },
    select: {
      name: true,
      bio: true,
      profilePicture: true,
      id: true,
      gender: true,
      dateOfBirth: true,
      email: true,
    },
  })

  if (!profile) {
    throw new SwipeProfileNotFoundError()
  }

  await ctx.prisma.$transaction(async (trx) => {
    const updateDailySwipesCount = trx.user.update({
      where: { id: currentUserId },
      data: {
        dailySwipesCount: currentUser.dailySwipesCount + 1,
      },
    })

    const createSwipe = trx.swipe.create({
      data: {
        userId: currentUserId,
        swipedId: profile.id,
      },
    })

    await Promise.all([updateDailySwipesCount, createSwipe])
  })

  return profile
}
