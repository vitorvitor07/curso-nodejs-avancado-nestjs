import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/__testing__/setup-prisma.tests'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { ListUsersUseCase } from '../../list-users.usecase'

describe('ListUsersUseCase Integration Tests', () => {
  const prismaService = new PrismaClient()
  let sut: ListUsersUseCase.UseCase
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
    sut = new ListUsersUseCase.UseCase(repository)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should return the users ordered by createdAt', async () => {
    const createAt = new Date()
    const entities: UserEntity[] = []
    const arrange = Array(3).fill(UserDataBuilder({}))
    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...element,
          email: `test${index}@mail.com`,
          createdAt: new Date(createAt.getTime() + index),
        }),
      )
    })

    await prismaService.user.createMany({
      data: entities.map(i => i.toJSON()),
    })

    const output = await sut.execute({})

    expect(output).toStrictEqual({
      items: entities.reverse().map(item => item.toJSON()),
      total: 3,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    })
  })

  it('should return output using filter, sort and paginate', async () => {
    const createAt = new Date()
    const entities: UserEntity[] = []
    const arrange = ['test', 'a', 'TEST', 'b', 'TeSt']
    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...UserDataBuilder({
            name: element,
          }),
          createdAt: new Date(createAt.getTime() + index),
        }),
      )
    })

    await prismaService.user.createMany({
      data: entities.map(i => i.toJSON()),
    })

    let output = await sut.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'TEST',
    })

    await expect(output).toMatchObject({
      items: [entities[0].toJSON(), entities[4].toJSON()],
      total: 3,
      currentPage: 1,
      perPage: 2,
    })

    output = await sut.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'TEST',
    })

    await expect(output).toMatchObject({
      items: [entities[2].toJSON()],
      total: 3,
      currentPage: 2,
      perPage: 2,
    })
  })
})
