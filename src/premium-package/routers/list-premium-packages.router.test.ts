import express from 'express'
import request from 'supertest'
import { errorMiddleware } from '../../__shared__/middlewares'
import { context } from '../../context'
import { listPremiumPackagesService } from '../services/list-premium-packages.service'
import { listPremiumPackagesRouter } from './list-premium-packages.router'

// Mock the listPremiumPackagesService
jest.mock('../services/list-premium-packages.service')

// Mock the context
jest.mock('../../context', () => ({
  context: {
    prisma: {},
  },
}))

describe('List Premium Packages Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(listPremiumPackagesRouter)
    app.use(errorMiddleware)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and list of premium packages', async () => {
    const mockPremiumPackages = [
      {
        id: '1',
        name: 'Basic',
        price: 9.99,
        description: 'Basic package',
        code: 'BASIC',
      },
      {
        id: '2',
        name: 'Pro',
        price: 19.99,
        description: 'Pro package',
        code: 'PRO',
      },
    ]
    ;(listPremiumPackagesService as jest.Mock).mockResolvedValue(
      mockPremiumPackages,
    )

    const response = await request(app).get('/premium-packages')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ result: mockPremiumPackages, ok: true })
    expect(listPremiumPackagesService).toHaveBeenCalledWith(context)
  })

  it('should return 200 and empty array when no premium packages exist', async () => {
    ;(listPremiumPackagesService as jest.Mock).mockResolvedValue([])

    const response = await request(app).get('/premium-packages')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ result: [], ok: true })
    expect(listPremiumPackagesService).toHaveBeenCalledWith(context)
  })

  it('should return 500 when service throws an error', async () => {
    ;(listPremiumPackagesService as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    )

    const response = await request(app).get('/premium-packages')

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
    expect(listPremiumPackagesService).toHaveBeenCalledWith(context)
  })

  it('should return only selected fields in the result', async () => {
    const mockPremiumPackages = [
      {
        id: '1',
        name: 'Basic',
        price: 9.99,
        description: 'Basic package',
        code: 'BASIC',
      },
    ]
    ;(listPremiumPackagesService as jest.Mock).mockResolvedValue(
      mockPremiumPackages,
    )

    const response = await request(app).get('/premium-packages')

    expect(response.status).toBe(200)
    expect(response.body.result[0]).toHaveProperty('id')
    expect(response.body.result[0]).toHaveProperty('name')
    expect(response.body.result[0]).toHaveProperty('price')
    expect(response.body.result[0]).toHaveProperty('description')
    expect(response.body.result[0]).toHaveProperty('code')
    expect(response.body.result[0]).not.toHaveProperty('createdAt')
    expect(response.body.result[0]).not.toHaveProperty('updatedAt')
  })
})
