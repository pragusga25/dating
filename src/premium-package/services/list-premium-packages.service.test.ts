import {
  type Context,
  type MockContext,
  createMockContext,
} from '../../context'
import { listPremiumPackagesService } from './list-premium-packages.service'

let mockCtx: MockContext
let ctx: Context

beforeEach(() => {
  mockCtx = createMockContext()
  ctx = mockCtx as unknown as Context
})

describe('listPremiumPackagesService', () => {
  it('should return a list of premium packages', async () => {
    const mockPremiumPackages = [
      {
        id: '1',
        name: 'Basic',
        price: 9.99,
        description: 'Basic package',
        code: 'BASIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Pro',
        price: 19.99,
        description: 'Pro package',
        code: 'PRO',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    mockCtx.prisma.premiumPackage.findMany.mockResolvedValue(
      mockPremiumPackages,
    )

    const result = await listPremiumPackagesService(ctx)

    expect(result).toEqual(mockPremiumPackages)
    expect(mockCtx.prisma.premiumPackage.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        code: true,
      },
    })
  })

  it('should return an empty array when no premium packages exist', async () => {
    mockCtx.prisma.premiumPackage.findMany.mockResolvedValue([])

    const result = await listPremiumPackagesService(ctx)

    expect(result).toEqual([])
    expect(mockCtx.prisma.premiumPackage.findMany).toHaveBeenCalled()
  })

  it('should throw an error when database query fails', async () => {
    const mockError = new Error('Database query failed')
    mockCtx.prisma.premiumPackage.findMany.mockRejectedValue(mockError)

    await expect(listPremiumPackagesService(ctx)).rejects.toThrow(
      'Database query failed',
    )
  })
})
