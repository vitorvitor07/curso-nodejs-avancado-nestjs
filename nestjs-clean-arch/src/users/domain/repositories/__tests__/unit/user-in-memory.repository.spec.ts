import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { UserEntity } from '../../../entities/user.entity'
import { UserDataBuilder } from '../../../testing/helpers/user-data-builder'

describe('UserInMomeoryRepository unit tests', () => {
  let sut: UserInMemoryRepository

  beforeEach(() => {
    sut = new UserInMemoryRepository()
  })

  it('Should throw error when not found - findByEmail method', async () => {
    await expect(sut.findByEmail('a@test.com')).rejects.toThrow(
      new NotFoundError('Entity not found using email a@test.com'),
    )
  })

  it('Should find a entity by email - findByEmail method', async () => {
    const entity = new UserEntity(UserDataBuilder({}))

    await sut.insert(entity)

    const result = await sut.findByEmail(entity.email)

    expect(entity.toJSON()).toStrictEqual(result.toJSON())
  })

  it('Should throw error when email exists - emailExists method', async () => {
    const entity = new UserEntity(UserDataBuilder({}))

    await sut.insert(entity)

    await expect(sut.emailExists(entity.email)).rejects.toThrow(
      new ConflictError('Email address already used'),
    )
  })

  it('Should find a entity by email - findByEmail method', async () => {
    expect.assertions(0)
    await sut.emailExists('a@a.com')
  })

  it('Should no filter items when filter obejct is null', async () => {
    const entity = new UserEntity(UserDataBuilder({}))

    await sut.insert(entity)

    const result = await sut.findAll()

    const spyFilter = jest.spyOn(result, 'filter')

    const itemsFiltred = await sut['applyFilter'](result, null)

    expect(spyFilter).not.toHaveBeenCalled()

    expect(itemsFiltred).toStrictEqual(result)
  })

  it('Should filter name field using filter param', async () => {
    const items = [
      new UserEntity(UserDataBuilder({ name: 'TEST' })),
      new UserEntity(UserDataBuilder({ name: 'Test' })),
      new UserEntity(UserDataBuilder({ name: 'test' })),
    ]

    const spyFilter = jest.spyOn(items, 'filter')

    const itemsFiltred = await sut['applyFilter'](items, 'name')

    expect(spyFilter).toHaveBeenCalled()

    expect(itemsFiltred).toStrictEqual([items[0], items[1]])
  })
})
