import { Entity } from '@/shared/domain/entities/entity'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { InMomeoryRepository } from '../../in-memory-repository'

type StubEntityProps = {
  name: string
  price: number
}

class StubEntity extends Entity<StubEntityProps> {}

class StubInMemoryRepository extends InMomeoryRepository<StubEntity> {}

describe('InMomeoryRepository unit tests', () => {
  let sut: StubInMemoryRepository

  beforeEach(() => {
    sut = new StubInMemoryRepository()
  })

  it('Should inserts a new entity', async () => {
    const entity = new StubEntity({ name: 'Test Name', price: 50 })

    await sut.insert(entity)

    expect(entity.toJSON()).toStrictEqual(sut.itens[0].toJSON())
  })

  it('Should throw error when entity not found', async () => {
    await expect(sut.findById('fakeId')).rejects.toThrow(NotFoundError)
  })

  it('Should find a entity by id', async () => {
    const entity = new StubEntity({ name: 'Test Name', price: 50 })

    await sut.insert(entity)

    const result = await sut.findById(entity.id)

    expect(entity.toJSON()).toStrictEqual(result.toJSON())
  })

  it('Should find all entities', async () => {
    const entity = new StubEntity({ name: 'Test Name', price: 50 })

    await sut.insert(entity)

    const result = await sut.findAll()

    expect([entity]).toStrictEqual(result)
  })
})
