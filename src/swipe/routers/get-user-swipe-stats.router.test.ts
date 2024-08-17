import express from 'express'
import request from 'supertest'
import { MissingAccessTokenError } from '../../__shared__/errors'
import { errorMiddleware } from '../../__shared__/middlewares'
import { auth } from '../../__shared__/middlewares'
import { context } from '../../context'
import { getUserSwipeStatsService } from '../services/get-user-swipe-stats.service'
import { getUserSwipeStatsRouter } from './get-user-swipe-stats.router'

// Mock the getUserSwipeStatsService
jest.mock('../services/get-user-swipe-stats.service')

// Mock the context
jest.mock('../../context', () => ({
  context: {
    prisma: {},
  },
}))

// Mock the auth middleware
jest.mock('../../__shared__/middlewares', () => ({
  ...jest.requireActual('../../__shared__/middlewares'),
  auth: jest.fn((req, res, next) => next()),
}))

describe('Get User Swipe Stats Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(getUserSwipeStatsRouter)
    app.use(errorMiddleware)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and swipe stats for authenticated user', async () => {
    const mockStats = {
      totalSwipes: 50,
      totalLikes: 30,
      totalPasses: 20,
      totalSwipesToday: 5,
      swipedToday: [
        // mock swipe objects
      ],
    }
    ;(getUserSwipeStatsService as jest.Mock).mockResolvedValue(mockStats)
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .get('/swipes/stats')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ result: mockStats, ok: true })
    expect(getUserSwipeStatsService).toHaveBeenCalledWith(context, '1')
  })

  it('should return 401 when no token is provided', async () => {
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      throw new MissingAccessTokenError()
    })

    const response = await request(app).get('/swipes/stats')

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 500 for unexpected errors', async () => {
    ;(getUserSwipeStatsService as jest.Mock).mockRejectedValue(
      new Error('Unexpected error'),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .get('/swipes/stats')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 200 and empty stats for user with no swipes', async () => {
    const emptyStats = {
      totalSwipes: 0,
      totalLikes: 0,
      totalPasses: 0,
      totalSwipesToday: 0,
      swipedToday: [],
    }
    ;(getUserSwipeStatsService as jest.Mock).mockResolvedValue(emptyStats)
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '2', email: 'newuser@example.com' }
      next()
    })

    const response = await request(app)
      .get('/swipes/stats')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ result: emptyStats, ok: true })
    expect(getUserSwipeStatsService).toHaveBeenCalledWith(context, '2')
  })
})
