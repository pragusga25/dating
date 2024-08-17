import { Gender } from '@prisma/client'
import {
  type Context,
  type MockContext,
  createMockContext,
} from '../../context'
import { UserNotFoundError } from '../errors'
import { meService } from './me.service'

describe('meService', () => {
  let mockCtx: MockContext
  let ctx: Context

  const mockUser = {
    id: 'userId',
    name: 'Test User',
    email: 'test@example.com',
    profilePicture: 'https://example.com/pic.jpg',
    bio: 'Test bio',
    isVerified: true,
    isPremium: false,
    dateOfBirth: new Date('1990-01-01'),
    dailySwipesCount: 5,
    gender: Gender.MALE,
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
    jest.clearAllMocks()
  })

  it('should return user data when user is found', async () => {
    // Arrange
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser)

    // Act
    const result = await meService(ctx, 'userId')

    // Assert
    expect(result).toEqual(mockUser)
    expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'userId' },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        bio: true,
        isVerified: true,
        isPremium: true,
        dateOfBirth: true,
        dailySwipesCount: true,
        gender: true,
      },
    })
  })

  it('should throw UserNotFoundError when user is not found', async () => {
    // Arrange
    mockCtx.prisma.user.findUnique.mockResolvedValue(null)

    // Act & Assert
    await expect(meService(ctx, 'nonExistentUserId')).rejects.toThrow(
      UserNotFoundError,
    )
    expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'nonExistentUserId' },
      select: expect.any(Object),
    })
  })

  it('should return correct user data structure', async () => {
    // Arrange
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser)

    // Act
    const result = await meService(ctx, 'userId')

    // Assert
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('email')
    expect(result).toHaveProperty('profilePicture')
    expect(result).toHaveProperty('bio')
    expect(result).toHaveProperty('isVerified')
    expect(result).toHaveProperty('isPremium')
    expect(result).toHaveProperty('dateOfBirth')
    expect(result).toHaveProperty('dailySwipesCount')
    expect(result).toHaveProperty('gender')
  })

  it('should handle different user data correctly', async () => {
    // Arrange
    const differentUser = {
      ...mockUser,
      id: 'differentUserId',
      name: 'Different User',
      email: 'different@example.com',
      isPremium: true,
      gender: Gender.FEMALE,
    }
    mockCtx.prisma.user.findUnique.mockResolvedValue(differentUser)

    // Act
    const result = await meService(ctx, 'differentUserId')

    // Assert
    expect(result).toEqual(differentUser)
    expect(result.id).toBe('differentUserId')
    expect(result.name).toBe('Different User')
    expect(result.email).toBe('different@example.com')
    expect(result.isPremium).toBe(true)
    expect(result.gender).toBe(Gender.FEMALE)
  })
})
