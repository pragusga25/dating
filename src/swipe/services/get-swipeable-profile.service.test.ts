import { Action, Gender } from '@prisma/client'
import { CurrentUserNotFound } from '../../__shared__/errors'
import {
  type Context,
  type MockContext,
  createMockContext,
} from '../../context'
import {
  DailySwipeLimitReachedError,
  SwipeProfileNotFoundError,
} from '../errors'
import { getSwipeableProfileService } from './get-swipeable-profile.service'

describe('getSwipeableProfileService', () => {
  let mockCtx: MockContext
  let ctx: Context

  const mockCurrentUser = {
    id: 'currentUserId',
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

  const mockSwipeableUser = {
    ...mockCurrentUser,
    id: 'swipeableUserId',
    name: 'Swipeable User',
    bio: 'A bio',
    profilePicture: 'https://example.com/pic.jpg',
  }

  const mockSwipeable = {
    id: 'mockSwipeableId',
    userId: 'currentUserId',
    swipedId: 'swipeableUserId',
    action: Action.PASS,
    createdAt: new Date(),
  }

  const mockSwapedToday = {
    id: 'mockSwapedTodayId',
    userId: 'currentUserId',
    swipedId: 'swipedUserId',
    action: Action.LIKE,
    createdAt: new Date(),
  }

  beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
    jest.clearAllMocks()
  })

  it('should return a swipeable profile when available', async () => {
    // Arrange
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockCurrentUser)
    mockCtx.prisma.swipe.findMany.mockResolvedValue([])
    mockCtx.prisma.user.findFirst.mockResolvedValue(mockSwipeableUser)
    mockCtx.prisma.$transaction.mockImplementation((callback) =>
      callback(mockCtx.prisma),
    )
    mockCtx.prisma.user.update.mockResolvedValue({
      ...mockCurrentUser,
      dailySwipesCount: 1,
    })
    mockCtx.prisma.swipe.create.mockResolvedValue(mockSwipeable)

    // Act
    const result = await getSwipeableProfileService(ctx, 'currentUserId')

    // Assert
    expect(result).toEqual(mockSwipeableUser)
    expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'currentUserId' },
    })
    expect(mockCtx.prisma.swipe.findMany).toHaveBeenCalled()
    expect(mockCtx.prisma.user.findFirst).toHaveBeenCalled()
    expect(mockCtx.prisma.$transaction).toHaveBeenCalled()
    expect(mockCtx.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'currentUserId' },
      data: { dailySwipesCount: 1 },
    })
    expect(mockCtx.prisma.swipe.create).toHaveBeenCalledWith({
      data: {
        userId: 'currentUserId',
        swipedId: 'swipeableUserId',
      },
    })
  })

  it('should throw CurrentUserNotFound when current user is not found', async () => {
    // Arrange
    mockCtx.prisma.user.findUnique.mockResolvedValue(null)

    // Act & Assert
    await expect(
      getSwipeableProfileService(ctx, 'nonexistentUserId'),
    ).rejects.toThrow(CurrentUserNotFound)
  })

  it('should throw DailySwipeLimitReachedError when non-premium user reaches swipe limit', async () => {
    // Arrange
    mockCtx.prisma.user.findUnique.mockResolvedValue({
      ...mockCurrentUser,
      dailySwipesCount: 10,
    })

    // Act & Assert
    await expect(
      getSwipeableProfileService(ctx, 'currentUserId'),
    ).rejects.toThrow(DailySwipeLimitReachedError)
  })

  it('should not throw DailySwipeLimitReachedError for premium users', async () => {
    // Arrange
    mockCtx.prisma.user.findUnique.mockResolvedValue({
      ...mockCurrentUser,
      dailySwipesCount: 10,
      isPremium: true,
    })
    mockCtx.prisma.swipe.findMany.mockResolvedValue([])
    mockCtx.prisma.user.findFirst.mockResolvedValue(mockSwipeableUser)
    mockCtx.prisma.swipe.create.mockResolvedValue(mockSwipeable)

    // Act
    const result = await getSwipeableProfileService(ctx, 'currentUserId')

    // Assert
    expect(result).toEqual(mockSwipeableUser)
  })

  it('should throw SwipeProfileNotFoundError when no swipeable profile is available', async () => {
    // Arrange
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockCurrentUser)
    mockCtx.prisma.swipe.findMany.mockResolvedValue([])
    mockCtx.prisma.user.findFirst.mockResolvedValue(null)

    // Act & Assert
    await expect(
      getSwipeableProfileService(ctx, 'currentUserId'),
    ).rejects.toThrow(SwipeProfileNotFoundError)
  })

  it('should not return profiles that have been swiped today', async () => {
    // Arrange
    const swipedToday = [mockSwapedToday]
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockCurrentUser)
    mockCtx.prisma.swipe.findMany.mockResolvedValue(swipedToday)
    mockCtx.prisma.user.findFirst.mockResolvedValue(mockSwipeableUser)
    mockCtx.prisma.$transaction.mockImplementation((callback) =>
      callback(mockCtx.prisma),
    )
    mockCtx.prisma.user.update.mockResolvedValue({
      ...mockCurrentUser,
      dailySwipesCount: 1,
    })
    mockCtx.prisma.swipe.create.mockResolvedValue(mockSwipeable)

    // Act
    await getSwipeableProfileService(ctx, 'currentUserId')

    // Assert
    expect(mockCtx.prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: expect.objectContaining({
            notIn: ['swipedUserId'],
          }),
        }),
      }),
    )
  })
})
