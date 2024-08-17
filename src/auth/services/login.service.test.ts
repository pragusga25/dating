import { Gender } from '@prisma/client'
import bcrypt from 'bcrypt'
import { generateAccessToken } from '../../__shared__/utils'
import {
  type Context,
  type MockContext,
  createMockContext,
} from '../../context'
import { InvalidCredentialsError } from '../errors'
import { loginService } from './login.service'

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}))

// Mock generateAccessToken
jest.mock('../../__shared__/utils', () => ({
  generateAccessToken: jest.fn(),
}))

describe('loginService', () => {
  const mockUser = {
    id: 'someId',
    name: 'test',
    email: 'test@example.com',
    password: 'hashedPassword',
    dateOfBirth: new Date(),
    gender: Gender.MALE,
    bio: 'Some bio',
    profilePicture: 'https://example.com/avatar.png',
    isVerified: true,
    isPremium: false,
    dailySwipesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  let mockCtx: MockContext
  let ctx: Context

  beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
    jest.clearAllMocks()
  })

  it('should return user data when credentials are valid', async () => {
    // Arrange
    const loginDto = { email: 'test@example.com', password: 'correctPassword' }
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(generateAccessToken as jest.Mock).mockReturnValue('mockedAccessToken')

    // Act
    const result = await loginService(mockCtx, loginDto)

    // Assert
    expect(result).toEqual({
      user: { id: mockUser.id, email: mockUser.email },
      accessToken: 'mockedAccessToken',
    })
    expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginDto.email },
    })
    expect(bcrypt.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.password,
    )
    expect(generateAccessToken).toHaveBeenCalledWith({
      id: mockUser.id,
      email: mockUser.email,
    })
  })

  it('should throw InvalidCredentialsError when user is not found', async () => {
    // Arrange
    const loginDto = {
      email: 'nonexistent@example.com',
      password: 'somePassword',
    }
    mockCtx.prisma.user.findUnique.mockResolvedValue(null)

    // Act & Assert
    await expect(loginService(mockCtx, loginDto)).rejects.toThrow(
      InvalidCredentialsError,
    )
    expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginDto.email },
    })
    expect(bcrypt.compare).not.toHaveBeenCalled()
    expect(generateAccessToken).not.toHaveBeenCalled()
  })

  it('should throw InvalidCredentialsError when password is incorrect', async () => {
    // Arrange
    const loginDto = { email: 'test@example.com', password: 'wrongPassword' }
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    // Act & Assert
    await expect(loginService(mockCtx, loginDto)).rejects.toThrow(
      InvalidCredentialsError,
    )
    expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: loginDto.email },
    })
    expect(bcrypt.compare).toHaveBeenCalledWith(
      loginDto.password,
      mockUser.password,
    )
    expect(generateAccessToken).not.toHaveBeenCalled()
  })
})
