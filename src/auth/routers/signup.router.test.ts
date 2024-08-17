import express from 'express'
import request from 'supertest'
import { errorMiddleware } from '../../__shared__/middlewares'
import { context } from '../../context'
import { EmailAlreadyExistsError } from '../errors'
import { signupService } from '../services/signup.service'
import { signupRouter } from './signup.router'

// Mock the signupService
jest.mock('../services/signup.service')

// Mock the context
jest.mock('../../context', () => ({
  context: {
    prisma: {},
  },
}))

describe('Signup Route', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use(signupRouter)
    app.use(errorMiddleware)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 201 and user data for valid signup data', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    }
    ;(signupService as jest.Mock).mockResolvedValue(mockUser)

    const response = await request(app).post('/auth/signup').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
    })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({ result: mockUser, ok: true })
    expect(signupService).toHaveBeenCalledWith(context, {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MALE',
    })
  })

  it('should return 400 for invalid request body', async () => {
    const response = await request(app)
      .post('/auth/signup')
      .send({ email: 'invalid-email', password: '123' })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 409 when email already exists', async () => {
    ;(signupService as jest.Mock).mockRejectedValue(
      new EmailAlreadyExistsError(),
    )

    const response = await request(app).post('/auth/signup').send({
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
    })

    expect(response.status).toBe(409)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 500 for unexpected errors', async () => {
    ;(signupService as jest.Mock).mockRejectedValue(
      new Error('Unexpected error'),
    )

    const response = await request(app).post('/auth/signup').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
    })

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('error')
  })
})
