import express from 'express'
import request from 'supertest'
import { MissingAccessTokenError } from '../../__shared__/errors'
import { errorMiddleware } from '../../__shared__/middlewares'
import { auth } from '../../__shared__/middlewares'
import { context } from '../../context'
import { UserNotFoundError } from '../errors'
import { meService } from '../services/me.service'
import { meRouter } from './me.router'

// Mock the meService
jest.mock('../services/me.service')

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

describe('Me Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(meRouter)
    app.use(errorMiddleware)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and user data for authenticated user', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      profilePicture: 'https://example.com/pic.jpg',
      bio: 'Test bio',
      isVerified: true,
      isPremium: false,
      dateOfBirth: new Date('1990-01-01').toISOString(),
      dailySwipesCount: 5,
      gender: 'MALE',
    }
    ;(meService as jest.Mock).mockResolvedValue(mockUser)
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ result: mockUser, ok: true })
    expect(meService).toHaveBeenCalledWith(context, '1')
  })

  it('should return 401 when no token is provided', async () => {
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      throw new MissingAccessTokenError()
    })

    const response = await request(app).get('/auth/me')

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 404 when user is not found', async () => {
    ;(meService as jest.Mock).mockRejectedValue(new UserNotFoundError())
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 'nonexistent', email: 'nonexistent@example.com' }
      next()
    })

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 500 for unexpected errors', async () => {
    ;(meService as jest.Mock).mockRejectedValue(new Error('Unexpected error'))
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: '1', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer mock-token')

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
  })
})
