import type { Context } from '../../context'
import type { UpdateSwipeActionDto } from '../dtos/update-swipe-action.dto'
import { SwipeNotFoundError } from '../errors'

export const updateSwipeActionService = async (
  ctx: Context,
  currentUserId: string,
  updateSwipActionDto: UpdateSwipeActionDto,
) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const swipe = await ctx.prisma.swipe.findFirst({
    where: {
      id: updateSwipActionDto.swipeId,
      userId: currentUserId,
      createdAt: {
        gte: today,
      },
    },
  })

  if (!swipe) {
    throw new SwipeNotFoundError()
  }

  return ctx.prisma.swipe.update({
    where: {
      id: updateSwipActionDto.swipeId,
    },
    data: {
      action: updateSwipActionDto.action,
    },
  })
}
