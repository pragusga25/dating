import { faker } from '@faker-js/faker'
import { Gender, type User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { context } from './context'

export const seed = async () => {
  console.log('Seeding database...')
  // Create a user
  const password = await bcrypt.hash('password123', 12)
  const usersData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = Array.from(
    { length: 200 },
    () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: password,
      bio: faker.lorem.sentence(),
      profilePicture: faker.image.avatar(),
      isVerified: false,
      isPremium: false,
      dateOfBirth: faker.date.past(),
      dailySwipesCount: 0,
      gender: faker.helpers.arrayElement(Object.values(Gender)),
    }),
  )
  usersData[0].email = 'user@email.com'

  await context.prisma.user.createMany({
    data: usersData,
  })

  const premiumPackages = [
    {
      name: 'Premium Package 1',
      price: 10,
      code: 'premium',
      description: 'This is a premium package',
    },
    {
      name: 'Verification Package 1',
      price: 12,
      code: 'verification',
      description: 'This is a verification package',
    },
  ]

  await context.prisma.premiumPackage.createMany({
    data: premiumPackages,
  })

  console.log('Database seeded successfully!')
}

seed()
