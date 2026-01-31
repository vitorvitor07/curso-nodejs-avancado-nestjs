import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/__testing__/setup-prisma.tests'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { UserPrismaRepository } from '../../user-prisma.repository'

describe('UserPrismaRepository Integration Tests', () => {
  const prismaService = new PrismaClient()
  let sut: UserPrismaRepository
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
  })

  beforeEach(async () => {
    sut = new UserPrismaRepository(prismaService as any)
    await prismaService.user.deleteMany()
  })

  it('should throw error when entity not found', async () => {
    await expect(sut.findById('fake-id')).rejects.toThrow(
      new NotFoundError('UserModel not found using ID fake-id'),
    )
  })

  it('should finds a entity by id', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    })
    const output = await sut.findById(newUser.id)
    await expect(output.toJSON()).toStrictEqual(entity.toJSON())
  })

  it('should insert a new entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await sut.insert(entity)
    const result = await prismaService.user.findUnique({
      where: { id: entity.id },
    })
    await expect(result).toStrictEqual(entity.toJSON())
  })

  it('should return all users', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    const entities = await sut.findAll()
    await expect(entities).toHaveLength(1)
    entities.map(async item => {
      await expect(item.toJSON()).toStrictEqual(entity.toJSON())
    })
  })

  it('should throw error on update when entity not found', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(sut.update(entity)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`),
    )
  })

  it('should update a entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    entity.update('new name')
    await sut.update(entity)
    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    })
    await expect(output.name).toBe('new name')
  })

  it('should throw error on delete when entity not found', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(sut.delete(entity._id)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`),
    )
  })

  it('should delete a entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    await sut.delete(entity._id)
    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    })
    await expect(output).toBeNull()
  })

  it('should throw error when entity not found', async () => {
    await expect(sut.findByEmail('fake-email')).rejects.toThrow(
      new NotFoundError(`UserModel not found using email fake-email`),
    )
  })

  it('should finds a entity by email', async () => {
    const entity = new UserEntity(UserDataBuilder({ email: 'a@a.com' }))
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    })
    const output = await sut.findByEmail(newUser.email)
    await expect(output.toJSON()).toStrictEqual(entity.toJSON())
  })

  it('should throw error when entity found by email', async () => {
    const entity = new UserEntity(UserDataBuilder({ email: 'a@a.com' }))
    await prismaService.user.create({
      data: entity.toJSON(),
    })
    await expect(sut.emailExists(entity.email)).rejects.toThrow(
      new ConflictError('Email address already used'),
    )
  })

  it('should throw error when entity found by email', async () => {
    await expect.assertions(0)
    await sut.emailExists('a@a.com')
  })

  describe('search method tests', () => {
    it('should apply only pagination when the other params are null', async () => {
      const createAt = new Date()
      const entities: UserEntity[] = []
      const arrange = Array(16).fill(UserDataBuilder({}))
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

      const searchOutput = await sut.search(new UserRepository.SearchParams())
      const items = searchOutput.items
      await expect(searchOutput).toBeInstanceOf(UserRepository.SearchResult)
      await expect(searchOutput.total).toBe(16)
      await expect(searchOutput.items).toHaveLength(15)
      searchOutput.items.forEach(async item => {
        await expect(item).toBeInstanceOf(UserEntity)
      })
      items
        .reverse() // converter para a ordem original
        .forEach(async (item, index) => {
          await expect(`test${index + 1}@mail.com`).toBe(item.email)
        })
    })

    it('should search using filter, sort and paginate', async () => {
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

      const searchOutputPage1 = await sut.search(
        new UserRepository.SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      )

      await expect(searchOutputPage1.items[0].toJSON()).toMatchObject(
        entities[0].toJSON(),
      )
      await expect(searchOutputPage1.items[1].toJSON()).toMatchObject(
        entities[4].toJSON(),
      )

      const searchOutputPage2 = await sut.search(
        new UserRepository.SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      )

      await expect(searchOutputPage2.items[0].toJSON()).toMatchObject(
        entities[2].toJSON(),
      )
    })
  })
})
