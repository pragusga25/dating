import bcrypt from 'bcrypt'
import { generateAccessToken } from '../../__shared__/utils'
import type { Context } from '../../context'
import type { LoginDto } from '../dtos/login.dto'
import { InvalidCredentialsError } from '../errors'

export const loginService = async (ctx: Context, loginDto: LoginDto) => {
  const user = await ctx.prisma.user.findUnique({
    where: {
      email: loginDto.email,
    },
  })

  if (!user) {
    throw new InvalidCredentialsError()
  }

  const passwordMatch = await bcrypt.compare(loginDto.password, user.password)

  if (!passwordMatch) {
    throw new InvalidCredentialsError()
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    accessToken: generateAccessToken({
      id: user.id,
      email: user.email,
    }),
  }
}
