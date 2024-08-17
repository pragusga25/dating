import type { Context } from '../../context'
import { UserNotFoundError } from '../errors'

export const meService = async (ctx: Context, currentUserId: string) => {
  const currUser = await ctx.prisma.user.findUnique({
    where: {
      id: currentUserId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profilePicture: true,
      bio: true,
      isVerified: true,
      isPremium: true,
      dateOfBirth: true,
      dailySwipesCount: true,
      gender: true,
    },
  })

  if (!currUser) {
    throw new UserNotFoundError()
  }

  return currUser
}
