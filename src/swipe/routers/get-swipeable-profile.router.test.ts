import express from 'express'
import request from 'supertest'
import { MissingAccessTokenError } from '../../__shared__/errors'
import { errorMiddleware } from '../../__shared__/middlewares'
import { auth } from '../../__shared__/middlewares'
import { context } from '../../context'
import {
  DailySwipeLimitReachedError,
  SwipeProfileNotFoundError,
} from '../errors'
import { getSwipeableProfileService } from '../services/get-swipeable-profile.service'
import { getSwipeableProfileRouter } from './get-swipeable-profile.router'

// Mock the getSwipeableProfileService
jest.mock('../services/get-swipeable-profile.service')

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

describe('Get Swipeable Profile Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(getSwipeableProfileRouter)
    app.use(errorMiddleware)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and swipeable profile for authenticated user', async () => {
    const mockProfile = {
      id: '2',
      name: 'Swipeable User',
      bio: 'Swipeable bio',
      profilePicture: 'https://example.com/swipeable.jpg',
    }
    ;(getSwipeableProfileService as jest.Mock).mockResolvedValue(mockProfile)
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .get('/swipes/profile')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ result: mockProfile, ok: true })
    expect(getSwipeableProfileService).toHaveBeenCalledWith(context, '1')
  })

  it('should return 401 when no token is provided', async () => {
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      throw new MissingAccessTokenError()
    })

    const response = await request(app).get('/swipes/profile')

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 403 when daily swipe limit is reached', async () => {
    ;(getSwipeableProfileService as jest.Mock).mockRejectedValue(
      new DailySwipeLimitReachedError(),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .get('/swipes/profile')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(403)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 404 when no swipeable profile is found', async () => {
    ;(getSwipeableProfileService as jest.Mock).mockRejectedValue(
      new SwipeProfileNotFoundError(),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .get('/swipes/profile')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 500 for unexpected errors', async () => {
    ;(getSwipeableProfileService as jest.Mock).mockRejectedValue(
      new Error('Unexpected error'),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .get('/swipes/profile')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
  })
})
