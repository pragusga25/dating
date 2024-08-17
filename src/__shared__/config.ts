import { config } from 'dotenv'
import { z } from 'zod'

config()

const envVarsSchema = z.object({
  PORT: z
    .string()
    .default('3000')
    .transform((value) => Number(value)),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default(''),
  JWT_EXPIRATION: z.number().default(24 * 60 * 60), // 1 day
})

export const envVars = envVarsSchema.parse(process.env)
