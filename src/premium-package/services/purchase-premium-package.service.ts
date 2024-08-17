import { Prisma } from '@prisma/client'
import { CurrentUserNotFound } from '../../__shared__/errors'
import type { Context } from '../../context'
import type { PurchasePremiumPackageDto } from '../dtos'
import {
  PremiumPackageAlreadyPurchasedError,
  PremiumPackageNotFoundError,
  UserAlreadyPremiumError,
  UserAlreadyVerifiedError,
} from '../errors'

export const purchasePremiumPackageService = async (
  ctx: Context,
  currentUserId: string,
  dto: PurchasePremiumPackageDto,
) => {
  try {
    const pckg = await ctx.prisma.premiumPackage.findUnique({
      where: {
        id: dto.premiumPackageId,
      },
    })

    if (!pckg) throw new PremiumPackageNotFoundError()

    const currUser = await ctx.prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
      select: {
        id: true,
        isPremium: true,
        isVerified: true,
      },
    })

    if (!currUser) throw new CurrentUserNotFound()

    if (currUser.isPremium && pckg.code === 'premium')
      throw new UserAlreadyPremiumError()
    if (currUser.isVerified && pckg.code === 'verification')
      throw new UserAlreadyVerifiedError()

    return await ctx.prisma.$transaction(async (trx) => {
      const updateUser = trx.user.update({
        where: { id: currentUserId },
        data: {
          isPremium: pckg.code === 'premium' || currUser.isPremium,
          isVerified: pckg.code === 'verification' || currUser.isVerified,
        },
      })

      const createPurchase = trx.purchase.create({
        data: {
          userId: currentUserId,
          premiumPackageId: dto.premiumPackageId,
        },
      })

      const [_, purchase] = await Promise.all([updateUser, createPurchase])

      return purchase
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new PremiumPackageAlreadyPurchasedError()
      }
    }

    throw err
  }
}
