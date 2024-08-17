import { Action, Gender } from '@prisma/client'
import {
  type Context,
  type MockContext,
  createMockContext,
} from '../../context'
import { getUserSwipeStatsService } from './get-user-swipe-stats.service'

describe('getUserSwipeStatsService', () => {
  let mockCtx: MockContext
  let ctx: Context

  const mockSwipedUser = {
    name: 'Test User',
    email: 'test@example.com',
    gender: Gender.FEMALE,
    bio: 'Test bio',
    isVerified: true,
    dateOfBirth: new Date('1990-01-01'),
    profilePicture: 'https://example.com/pic.jpg',
  }

  const createMockSwipe = (action: Action, createdAt: Date) => ({
    swiped: mockSwipedUser,
    action,
    createdAt,
    id: 'swipeId',
    swipedId: 'swipedId',
    userId: 'currentUserId',
  })

  beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
    jest.clearAllMocks()
  })

  it('should return correct swipe stats', async () => {
    // Arrange
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const mockSwipes = [
      createMockSwipe(Action.LIKE, today),
      createMockSwipe(Action.PASS, today),
      createMockSwipe(Action.LIKE, yesterday),
      createMockSwipe(Action.PASS, yesterday),
      createMockSwipe(Action.LIKE, yesterday),
    ]

    mockCtx.prisma.swipe.findMany.mockResolvedValue(mockSwipes)

    // Act
    const result = await getUserSwipeStatsService(ctx, 'currentUserId')

    // Assert
    expect(result).toEqual({
      totalSwipes: 5,
      totalLikes: 3,
      totalPasses: 2,
      totalSwipesToday: 2,
      swipedToday: [mockSwipes[0], mockSwipes[1]],
    })

    expect(mockCtx.prisma.swipe.findMany).toHaveBeenCalledWith({
      where: { userId: 'currentUserId' },
      select: {
        swiped: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
            bio: true,
            isVerified: true,
            dateOfBirth: true,
            profilePicture: true,
          },
        },
        id: true,
        action: true,
        createdAt: true,
      },
    })
  })

  it('should return zero stats when user has no swipes', async () => {
    // Arrange
    mockCtx.prisma.swipe.findMany.mockResolvedValue([])

    // Act
    const result = await getUserSwipeStatsService(ctx, 'currentUserId')

    // Assert
    expect(result).toEqual({
      totalSwipes: 0,
      totalLikes: 0,
      totalPasses: 0,
      totalSwipesToday: 0,
      swipedToday: [],
    })
  })

  it('should correctly count swipes made today', async () => {
    // Arrange
    const today = new Date()
    const mockSwipes = [
      createMockSwipe(Action.LIKE, today),
      createMockSwipe(Action.PASS, today),
      createMockSwipe(Action.LIKE, today),
    ]

    mockCtx.prisma.swipe.findMany.mockResolvedValue(mockSwipes)

    // Act
    const result = await getUserSwipeStatsService(ctx, 'currentUserId')

    // Assert
    expect(result.totalSwipesToday).toBe(3)
    expect(result.swipedToday).toHaveLength(3)
  })

  it('should handle swipes across multiple days', async () => {
    // Arrange
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const mockSwipes = [
      createMockSwipe(Action.LIKE, today),
      createMockSwipe(Action.PASS, yesterday),
      createMockSwipe(Action.LIKE, twoDaysAgo),
    ]

    mockCtx.prisma.swipe.findMany.mockResolvedValue(mockSwipes)

    // Act
    const result = await getUserSwipeStatsService(ctx, 'currentUserId')

    // Assert
    expect(result).toEqual({
      totalSwipes: 3,
      totalLikes: 2,
      totalPasses: 1,
      totalSwipesToday: 1,
      swipedToday: [mockSwipes[0]],
    })
  })
})
