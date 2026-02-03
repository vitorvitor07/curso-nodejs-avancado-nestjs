import { HashProvider } from '@/shared/application/providers/hash-provider'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/__testing__/setup-prisma.tests'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { BcrypthsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { SignUpUseCase } from '../../sign-up.usecase'

describe('SignUpUseCase Integration Tests', () => {
  const prismaService = new PrismaClient()
  let sut: SignUpUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule
  let hashProvider: HashProvider

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
    hashProvider = new BcrypthsHashProvider()
  })

  beforeEach(async () => {
    sut = new SignUpUseCase.UseCase(repository, hashProvider)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should create a user', async () => {
    const props = {
      name: 'test name',
      email: 'a@a.com',
      password: 'testPassword123',
    }

    const output = await sut.execute(props)
    await expect(output.id).toBeDefined()
    await expect(output.createdAt).toBeInstanceOf(Date)
  })
})
