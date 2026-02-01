import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/__testing__/setup-prisma.tests'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { DeleteUserUseCase } from '../../delete-user.usecase'

describe('DeleteUseCase Integration Tests', () => {
  const prismaService = new PrismaClient()
  let sut: DeleteUserUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
  })

  beforeEach(async () => {
    sut = new DeleteUserUseCase.UseCase(repository)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throw error when entity not found', async () => {
    await expect(sut.execute({ id: 'fake-id' })).rejects.toThrow(
      new NotFoundError('UserModel not found using ID fake-id'),
    )
  })

  it('should delete a user', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    await sut.execute({ id: entity._id })
    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    })
    await expect(output).toBeNull()
    const models = await prismaService.user.findMany()
    expect(models).toHaveLength(0)
  })
})
