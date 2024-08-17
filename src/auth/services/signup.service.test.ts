import { Gender, Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import {
  type Context,
  type MockContext,
  createMockContext,
} from '../../context'
import { EmailAlreadyExistsError } from '../errors'
import { signupService } from './signup.service'

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}))

describe('signupService', () => {
  const mockUser = {
    id: 'someId',
    name: 'test',
    email: 'test@example.com',
    password: 'hashedPassword',
    dateOfBirth: new Date('1990-01-01'),
    gender: Gender.MALE,
    bio: 'Some bio',
    profilePicture: 'https://example.com/avatar.png',
    isVerified: false,
    isPremium: false,
    dailySwipesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const signupDto = {
    name: 'test',
    email: 'test@example.com',
    password: 'password123',
    dateOfBirth: new Date('1990-01-01'),
    gender: Gender.MALE,
    profilePicture: 'https://example.com/avatar.png',
  }

  let mockCtx: MockContext
  let ctx: Context

  beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
    jest.clearAllMocks()
  })

  it('should create a new user when valid data is provided', async () => {
    // Arrange
    mockCtx.prisma.user.create.mockResolvedValue(mockUser)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')

    // Act
    const result = await signupService(mockCtx, signupDto)

    // Assert
    expect(result).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      dateOfBirth: mockUser.dateOfBirth,
      gender: mockUser.gender,
      bio: mockUser.bio,
      profilePicture: mockUser.profilePicture,
      isVerified: mockUser.isVerified,
      isPremium: mockUser.isPremium,
      dailySwipesCount: mockUser.dailySwipesCount,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    })
    expect(mockCtx.prisma.user.create).toHaveBeenCalledWith({
      data: {
        ...signupDto,
        password: 'hashedPassword',
      },
    })
    expect(bcrypt.hash).toHaveBeenCalledWith(signupDto.password, 12)
  })

  it('should throw EmailAlreadyExistsError when email is already in use', async () => {
    // Arrange
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`)',
      {
        code: 'P2002',
        clientVersion: '2.0.0',
      },
    )
    mockCtx.prisma.user.create.mockRejectedValue(prismaError)

    // Act & Assert
    await expect(signupService(mockCtx, signupDto)).rejects.toThrow(
      EmailAlreadyExistsError,
    )
    expect(mockCtx.prisma.user.create).toHaveBeenCalledWith({
      data: {
        ...signupDto,
        password: expect.any(String),
      },
    })
  })

  it('should throw original error for unknown errors', async () => {
    // Arrange
    const unknownError = new Error('Unknown error')
    mockCtx.prisma.user.create.mockRejectedValue(unknownError)

    // Act & Assert
    await expect(signupService(mockCtx, signupDto)).rejects.toThrow(
      unknownError,
    )
    expect(mockCtx.prisma.user.create).toHaveBeenCalledWith({
      data: {
        ...signupDto,
        password: expect.any(String),
      },
    })
  })
})
