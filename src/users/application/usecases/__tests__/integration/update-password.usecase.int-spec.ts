import { InvalidPasswordError } from '@/shared/application/errors/invalid-passoword-error'
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
import { UpdatePassordUseCase } from '../../update-password.usecase'

describe('UpdatePasswordUseCase Integration Tests', () => {
  const prismaService = new PrismaClient()
  let sut: UpdatePassordUseCase.UseCase
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
    sut = new UpdatePassordUseCase.UseCase(repository, hashProvider)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throw error when entity found by id', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(
      sut.execute({
        id: entity._id,
        oldPassword: 'old-password',
        password: 'new-password',
      }),
    ).rejects.toThrow(
      new NotFoundError('UserModel not found using ID ' + entity._id),
    )
  })

  it('should throw error when oldPassword not provided', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    await expect(
      sut.execute({
        id: entity._id,
        oldPassword: '',
        password: 'new-password',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    )
  })

  it('should throw error when password not provided', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    await expect(
      sut.execute({
        id: entity._id,
        oldPassword: 'old-password',
        password: '',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    )
  })

  it('should update a password', async () => {
    const oldPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(UserDataBuilder({ password: oldPassword }))
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    const output = await sut.execute({
      id: entity._id,
      oldPassword: '1234',
      password: 'newpassword',
    })

    const result = await hashProvider.compareHash(
      'newpassword',
      output.password,
    )

    expect(result).toBeTruthy()
  })
})
