import { Action } from '@prisma/client'
import {
  type Context,
  type MockContext,
  createMockContext,
} from '../../context'
import type { UpdateSwipeActionDto } from '../dtos/update-swipe-action.dto'
import { SwipeNotFoundError } from '../errors'
import { updateSwipeActionService } from './update-swipe-action.service'

describe('updateSwipeActionService', () => {
  let mockCtx: MockContext
  let ctx: Context

  const mockSwipe = {
    id: 'swipeId',
    userId: 'currentUserId',
    swipedId: 'swipedUserId',
    action: Action.PASS,
    createdAt: new Date(),
  }

  const updateSwipeActionDto: UpdateSwipeActionDto = {
    swipeId: 'swipeId',
    action: Action.LIKE,
  }

  beforeEach(() => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
    jest.clearAllMocks()
  })

  it('should update swipe action when swipe exists', async () => {
    // Arrange
    mockCtx.prisma.swipe.findFirst.mockResolvedValue(mockSwipe)
    mockCtx.prisma.swipe.update.mockResolvedValue({
      ...mockSwipe,
      action: Action.LIKE,
    })

    // Act
    const result = await updateSwipeActionService(
      ctx,
      'currentUserId',
      updateSwipeActionDto,
    )

    // Assert
    expect(result).toEqual({
      ...mockSwipe,
      action: Action.LIKE,
    })
    expect(mockCtx.prisma.swipe.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'swipeId',
        userId: 'currentUserId',
        createdAt: expect.any(Object),
      },
    })
    expect(mockCtx.prisma.swipe.update).toHaveBeenCalledWith({
      where: { id: 'swipeId' },
      data: { action: Action.LIKE },
    })
  })

  it('should throw SwipeNotFoundError when swipe does not exist', async () => {
    // Arrange
    mockCtx.prisma.swipe.findFirst.mockResolvedValue(null)

    // Act & Assert
    await expect(
      updateSwipeActionService(ctx, 'currentUserId', updateSwipeActionDto),
    ).rejects.toThrow(SwipeNotFoundError)
    expect(mockCtx.prisma.swipe.update).not.toHaveBeenCalled()
  })

  it('should not update swipe from a different day', async () => {
    // Arrange
    const yesterdaySwipe = {
      ...mockSwipe,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    }
    mockCtx.prisma.swipe.findFirst.mockResolvedValue(null)

    // Act & Assert
    await expect(
      updateSwipeActionService(ctx, 'currentUserId', updateSwipeActionDto),
    ).rejects.toThrow(SwipeNotFoundError)
    expect(mockCtx.prisma.swipe.update).not.toHaveBeenCalled()
  })

  it('should not update swipe for a different user', async () => {
    // Arrange
    mockCtx.prisma.swipe.findFirst.mockResolvedValue(null)

    // Act & Assert
    await expect(
      updateSwipeActionService(ctx, 'differentUserId', updateSwipeActionDto),
    ).rejects.toThrow(SwipeNotFoundError)
    expect(mockCtx.prisma.swipe.update).not.toHaveBeenCalled()
  })

  it('should handle different swipe actions', async () => {
    // Arrange
    mockCtx.prisma.swipe.findFirst.mockResolvedValue(mockSwipe)
    mockCtx.prisma.swipe.update.mockResolvedValue({
      ...mockSwipe,
      action: Action.PASS,
    })

    const passDto: UpdateSwipeActionDto = {
      ...updateSwipeActionDto,
      action: Action.PASS,
    }

    // Act
    const result = await updateSwipeActionService(ctx, 'currentUserId', passDto)

    // Assert
    expect(result).toEqual({
      ...mockSwipe,
      action: Action.PASS,
    })
    expect(mockCtx.prisma.swipe.update).toHaveBeenCalledWith({
      where: { id: 'swipeId' },
      data: { action: Action.PASS },
    })
  })
})
