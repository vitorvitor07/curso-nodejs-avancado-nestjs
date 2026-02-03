import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/__testing__/setup-prisma.tests'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { BcrypthsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { SignInUseCase } from '../../sign-in.usecase'

describe('SignInUseCase Integration Tests', () => {
  const prismaService = new PrismaClient()
  let sut: SignInUseCase.UseCase
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
    sut = new SignInUseCase.UseCase(repository, hashProvider)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should not be able to authenticate with wrong email', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(
      sut.execute({
        email: entity.email,
        password: 'new-password',
      }),
    ).rejects.toThrow(
      new NotFoundError('UserModel not found using email ' + entity.email),
    )
  })
  it('should not be able to authenticate with wrong password', async () => {
    const hashPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(
      UserDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
      }),
    )
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    await expect(
      sut.execute({
        email: entity.email,
        password: 'fake',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should throws error when email not provided', async () => {
    await expect(
      sut.execute({
        email: null,
        password: 'new-password',
      }),
    ).rejects.toBeInstanceOf(BadRequestError)
  })

  it('should throws error when password not provided', async () => {
    await expect(
      sut.execute({
        email: 'a@a.com',
        password: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestError)
  })

  it('should authenticate a user', async () => {
    const hashPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword }),
    )
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    const output = await sut.execute({
      email: 'a@a.com',
      password: '1234',
    })

    expect(output).toMatchObject(entity.toJSON())
  })
})
