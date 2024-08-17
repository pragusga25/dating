import express from 'express'
import request from 'supertest'
import { MissingAccessTokenError } from '../../__shared__/errors'
import { errorMiddleware } from '../../__shared__/middlewares'
import { auth } from '../../__shared__/middlewares'
import { context } from '../../context'
import { SwipeNotFoundError } from '../errors'
import { updateSwipeActionService } from '../services/update-swipe-action.service'
import { updateSwipeActionRouter } from './update-swipe-action.router'

// Mock the updateSwipeActionService
jest.mock('../services/update-swipe-action.service')

// Mock the context
jest.mock('../../context', () => ({
  context: {
    prisma: {},
  },
}))

// Mock the middlewares
jest.mock('../../__shared__/middlewares', () => ({
  ...jest.requireActual('../../__shared__/middlewares'),
  auth: jest.fn((req, res, next) => next()),
}))

describe('Update Swipe Action Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(updateSwipeActionRouter)
    app.use(errorMiddleware)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and updated swipe action for authenticated user with valid input', async () => {
    const mockUpdatedSwipe = {
      id: 'swipeId',
      userId: '1',
      swipedId: '2',
      action: 'LIKE',
    }
    ;(updateSwipeActionService as jest.Mock).mockResolvedValue(mockUpdatedSwipe)
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .put('/swipes')
      .set('Authorization', 'Bearer mock-token')
      .send({
        swipeId: 'swipeId',
        action: 'LIKE',
      })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ result: mockUpdatedSwipe, ok: true })
    expect(updateSwipeActionService).toHaveBeenCalledWith(context, '1', {
      swipeId: 'swipeId',
      action: 'LIKE',
    })
  })

  it('should return 401 when no token is provided', async () => {
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      throw new MissingAccessTokenError()
    })

    const response = await request(app).put('/swipes').send({
      swipeId: 'swipeId',
      swipedUserId: '2',
      action: 'LIKE',
    })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .put('/swipes')
      .set('Authorization', 'Bearer mock-token')
      .send({
        swipeId: 'swipeId',
        swipedUserId: '2',
        action: 'INVALID_ACTION',
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 404 when swipe is not found', async () => {
    ;(updateSwipeActionService as jest.Mock).mockRejectedValue(
      new SwipeNotFoundError(),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .put('/swipes')
      .set('Authorization', 'Bearer mock-token')
      .send({
        swipeId: 'nonexistentSwipeId',
        swipedUserId: '2',
        action: 'LIKE',
      })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 500 for unexpected errors', async () => {
    ;(updateSwipeActionService as jest.Mock).mockRejectedValue(
      new Error('Unexpected error'),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .put('/swipes')
      .set('Authorization', 'Bearer mock-token')
      .send({
        swipeId: 'swipeId',
        swipedUserId: '2',
        action: 'LIKE',
      })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
  })
})
