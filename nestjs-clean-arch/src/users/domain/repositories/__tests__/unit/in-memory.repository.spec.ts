import { Entity } from '@/shared/domain/entities/entity'
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
})
