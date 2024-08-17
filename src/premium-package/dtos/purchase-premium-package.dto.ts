import { z } from 'zod'

export const PurchasePremiumPackageSchema = z.object({
  premiumPackageId: z.string(),
})

export type PurchasePremiumPackageDto = z.infer<
  typeof PurchasePremiumPackageSchema
>
