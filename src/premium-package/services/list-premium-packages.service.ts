import type { Context } from '../../context'

export const listPremiumPackagesService = async (ctx: Context) => {
  return ctx.prisma.premiumPackage.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      code: true,
    },
  })
}
