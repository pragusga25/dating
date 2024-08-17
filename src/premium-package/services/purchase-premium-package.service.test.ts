import { Gender, Prisma } from '@prisma/client'
import { CurrentUserNotFound } from '../../__shared__/errors'
import {
  type Context,
  type MockContext,
  createMockContext,
} from '../../context'
import {
  PremiumPackageAlreadyPurchasedError,
  PremiumPackageNotFoundError,
  UserAlreadyPremiumError,
  UserAlreadyVerifiedError,
} from '../errors'
import { purchasePremiumPackageService } from './purchase-premium-package.service'

let mockCtx: MockContext
let ctx: Context

beforeEach(() => {
  mockCtx = createMockContext()
  ctx = mockCtx as unknown as Context
})

describe('purchasePremiumPackageService', () => {
  const mockPremiumPackage = {
    id: 'premium-package-id',
    code: 'premium',
    name: 'Premium Package',
    description: 'Unlock premium features',
    price: 9.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockVerificationPackage = {
    id: 'verification-package-id',
    code: 'verification',
    name: 'Verification Package',
    description: 'Get verified',
    price: 4.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockUser = {
    id: 'user-id',
    name: 'test',
    email: 'test@example.com',
    password: 'hashedPassword',
    dateOfBirth: new Date(),
    gender: Gender.MALE,
    bio: 'Some bio',
    profilePicture: 'https://example.com/avatar.png',
    isVerified: false,
    isPremium: false,
    dailySwipesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPurchase = {
    id: 'purchase-id',
    userId: 'user-id',
    premiumPackageId: 'premium-package-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should successfully purchase a premium package', async () => {
    mockCtx.prisma.premiumPackage.findUnique.mockResolvedValue(
      mockPremiumPackage,
    )
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser)
    mockCtx.prisma.$transaction.mockImplementation((callback) =>
      callback(mockCtx.prisma),
    )
    mockCtx.prisma.user.update.mockResolvedValue({
      ...mockUser,
      isPremium: true,
    })
    mockCtx.prisma.purchase.create.mockResolvedValue(mockPurchase)

    const result = await purchasePremiumPackageService(ctx, 'user-id', {
      premiumPackageId: 'premium-package-id',
    })

    expect(result).toEqual(mockPurchase)
    expect(mockCtx.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { isPremium: true, isVerified: false },
    })
  })

  it('should successfully purchase a verification package', async () => {
    mockCtx.prisma.premiumPackage.findUnique.mockResolvedValue(
      mockVerificationPackage,
    )
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser)
    mockCtx.prisma.$transaction.mockImplementation((callback) =>
      callback(mockCtx.prisma),
    )
    mockCtx.prisma.user.update.mockResolvedValue({
      ...mockUser,
      isVerified: true,
    })
    mockCtx.prisma.purchase.create.mockResolvedValue({
      ...mockPurchase,
      premiumPackageId: 'verification-package-id',
    })

    const result = await purchasePremiumPackageService(ctx, 'user-id', {
      premiumPackageId: 'verification-package-id',
    })

    expect(result).toEqual({
      ...mockPurchase,
      premiumPackageId: 'verification-package-id',
    })
    expect(mockCtx.prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { isPremium: false, isVerified: true },
    })
  })

  it('should throw PremiumPackageNotFoundError if package does not exist', async () => {
    mockCtx.prisma.premiumPackage.findUnique.mockResolvedValue(null)

    await expect(
      purchasePremiumPackageService(ctx, 'user-id', {
        premiumPackageId: 'non-existent-id',
      }),
    ).rejects.toThrow(PremiumPackageNotFoundError)
  })

  it('should throw CurrentUserNotFound if user does not exist', async () => {
    mockCtx.prisma.premiumPackage.findUnique.mockResolvedValue(
      mockPremiumPackage,
    )
    mockCtx.prisma.user.findUnique.mockResolvedValue(null)

    await expect(
      purchasePremiumPackageService(ctx, 'non-existent-user', {
        premiumPackageId: 'premium-package-id',
      }),
    ).rejects.toThrow(CurrentUserNotFound)
  })

  it('should throw UserAlreadyPremiumError if user is already premium', async () => {
    mockCtx.prisma.premiumPackage.findUnique.mockResolvedValue(
      mockPremiumPackage,
    )
    mockCtx.prisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      isPremium: true,
    })

    await expect(
      purchasePremiumPackageService(ctx, 'user-id', {
        premiumPackageId: 'premium-package-id',
      }),
    ).rejects.toThrow(UserAlreadyPremiumError)
  })

  it('should throw UserAlreadyVerifiedError if user is already verified', async () => {
    mockCtx.prisma.premiumPackage.findUnique.mockResolvedValue(
      mockVerificationPackage,
    )
    mockCtx.prisma.user.findUnique.mockResolvedValue({
      ...mockUser,
      isVerified: true,
    })

    await expect(
      purchasePremiumPackageService(ctx, 'user-id', {
        premiumPackageId: 'verification-package-id',
      }),
    ).rejects.toThrow(UserAlreadyVerifiedError)
  })

  it('should throw PremiumPackageAlreadyPurchasedError if package is already purchased', async () => {
    mockCtx.prisma.premiumPackage.findUnique.mockResolvedValue(
      mockPremiumPackage,
    )
    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser)
    mockCtx.prisma.$transaction.mockImplementation(() => {
      throw new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '2.19.0',
        },
      )
    })

    await expect(
      purchasePremiumPackageService(ctx, 'user-id', {
        premiumPackageId: 'premium-package-id',
      }),
    ).rejects.toThrow(PremiumPackageAlreadyPurchasedError)
  })
})
