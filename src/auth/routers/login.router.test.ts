import express from 'express'
import request from 'supertest'
import { errorMiddleware } from '../../__shared__/middlewares'
import { context } from '../../context'
import { InvalidCredentialsError } from '../errors'
import { loginService } from '../services/login.service'
import { loginRouter } from './login.router'

// Mock the loginService
jest.mock('../services/login.service')

// Mock the context
jest.mock('../../context', () => ({
  context: {
    prisma: {},
  },
}))

describe('Login Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(loginRouter)
    app.use(errorMiddleware)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and user data for valid credentials', async () => {
    const mockUser = {
      user: { id: '1', email: 'test@example.com' },
      accessToken: 'mock-access-token',
    }
    ;(loginService as jest.Mock).mockResolvedValue(mockUser)

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ result: mockUser, ok: true })
    expect(loginService).toHaveBeenCalledWith(context, {
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('should return 400 for invalid request body', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'invalid-email', password: '123' })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 401 for invalid credentials', async () => {
    ;(loginService as jest.Mock).mockRejectedValue(
      new InvalidCredentialsError(),
    )

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 500 for unexpected errors', async () => {
    ;(loginService as jest.Mock).mockRejectedValue(
      new Error('Unexpected error'),
    )

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
  })
})
