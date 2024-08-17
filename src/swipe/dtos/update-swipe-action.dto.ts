import { Action } from '@prisma/client'
import { z } from 'zod'

export const UpdateSwipeActionSchema = z.object({
  action: z.nativeEnum(Action),
  swipeId: z.string(),
})

export type UpdateSwipeActionDto = z.infer<typeof UpdateSwipeActionSchema>
