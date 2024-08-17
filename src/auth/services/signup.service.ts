import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import type { Context } from '../../context'
import type { SignupDto } from '../dtos/signup.dto'
import { EmailAlreadyExistsError } from '../errors'

export const signupService = async (ctx: Context, signupDto: SignupDto) => {
  try {
    const { password, ...user } = await ctx.prisma.user.create({
      data: {
        ...signupDto,
        password: await bcrypt.hash(signupDto.password, 12),
      },
    })

    return user
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new EmailAlreadyExistsError()
      }
    }

    throw e
  }
}
