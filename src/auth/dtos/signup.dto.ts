import { Gender } from '@prisma/client'
import { z } from 'zod'

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(255),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((value) => new Date(value)),
  gender: z.nativeEnum(Gender),
  bio: z.string().max(255).optional(),
  profilePicture: z.string().url().optional(),
})

export type SignupDto = z.infer<typeof SignupSchema>
