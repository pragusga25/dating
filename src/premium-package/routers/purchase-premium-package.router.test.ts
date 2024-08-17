import express from 'express'
import request from 'supertest'
import { MissingAccessTokenError } from '../../__shared__/errors'
import { errorMiddleware } from '../../__shared__/middlewares'
import { auth } from '../../__shared__/middlewares'
import { context } from '../../context'
import { PremiumPackageNotFoundError, UserAlreadyPremiumError } from '../errors'
import { purchasePremiumPackageService } from '../services/purchase-premium-package.service'
import { purchasePremiumPackageRouter } from './purchase-premium-package.router'

// Mock the purchasePremiumPackageService
jest.mock('../services/purchase-premium-package.service')

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

describe('Purchase Premium Package Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(purchasePremiumPackageRouter)
    app.use(errorMiddleware)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 201 and purchase details for successful purchase', async () => {
    const mockPurchase = {
      id: 'purchase-id',
      userId: 'user-id',
      premiumPackageId: 'premium-package-id',
    }
    ;(purchasePremiumPackageService as jest.Mock).mockResolvedValue(
      mockPurchase,
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 'user-id', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .post('/premium-packages/purchase')
      .set('Authorization', 'Bearer mock-token')
      .send({ premiumPackageId: 'premium-package-id' })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ result: mockPurchase })
    expect(purchasePremiumPackageService).toHaveBeenCalledWith(
      context,
      'user-id',
      { premiumPackageId: 'premium-package-id' },
    )
  })

  it('should return 401 when no token is provided', async () => {
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      throw new MissingAccessTokenError()
    })

    const response = await request(app)
      .post('/premium-packages/purchase')
      .send({ premiumPackageId: 'premium-package-id' })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/premium-packages/purchase')
      .set('Authorization', 'Bearer mock-token')
      .send({ invalidField: 'invalid-data' })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 404 when premium package is not found', async () => {
    ;(purchasePremiumPackageService as jest.Mock).mockRejectedValue(
      new PremiumPackageNotFoundError(),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 'user-id', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .post('/premium-packages/purchase')
      .set('Authorization', 'Bearer mock-token')
      .send({ premiumPackageId: 'non-existent-package-id' })

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 400 when user is already premium', async () => {
    ;(purchasePremiumPackageService as jest.Mock).mockRejectedValue(
      new UserAlreadyPremiumError(),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 'user-id', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .post('/premium-packages/purchase')
      .set('Authorization', 'Bearer mock-token')
      .send({ premiumPackageId: 'premium-package-id' })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 500 for unexpected errors', async () => {
    ;(purchasePremiumPackageService as jest.Mock).mockRejectedValue(
      new Error('Unexpected error'),
    )
    ;(auth as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 'user-id', email: 'test@example.com' }
      next()
    })

    const response = await request(app)
      .post('/premium-packages/purchase')
      .set('Authorization', 'Bearer mock-token')
      .send({ premiumPackageId: 'premium-package-id' })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
  })
})
