import { Entity } from '@/shared/domain/entities/entity'
import { InMemorySearchableRepository } from '../../in-memory-searchable.repository'
import {
  SearchParams,
  SearchResult,
} from '../../searchable-repository-contracts'

type StubEntityProps = {
  name: string
  price: number
}

class StubEntity extends Entity<StubEntityProps> {}

class StubInMemorySearchableRepository extends InMemorySearchableRepository<StubEntity> {
  sortableFields: string[] = ['name']

  protected async applyFilter(
    items: StubEntity[],
    filter: string | null,
  ): Promise<StubEntity[]> {
    if (!filter) return items

    return items.filter(item => {
      return item.props.name.toLowerCase().includes(filter.toLowerCase())
    })
  }
}

describe('InMemoryRepository unit tests', () => {
  let sut: StubInMemorySearchableRepository

  beforeEach(() => {
    sut = new StubInMemorySearchableRepository()
  })

  describe('applyFilter method', () => {
    it('should no filter items when filter param is null', async () => {
      const items = [new StubEntity({ name: 'test', price: 50 })]
      const spyFilterMethod = jest.spyOn(items, 'filter')
      const itemsFiltered = await sut['applyFilter'](items, null)

      expect(itemsFiltered).toStrictEqual(items)
      expect(spyFilterMethod).not.toHaveBeenCalled()
    })

    it('should filter using a filter param', async () => {
      const items = [
        new StubEntity({ name: 'TEST', price: 50 }),
        new StubEntity({ name: 'test', price: 50 }),
        new StubEntity({ name: 'fake', price: 50 }),
      ]
      const spyFilterMethod = jest.spyOn(items, 'filter')

      let itemsFiltered = await sut['applyFilter'](items, 'test')

      expect(itemsFiltered).toStrictEqual([items[0], items[1]])
      expect(spyFilterMethod).toHaveBeenCalledTimes(1)

      itemsFiltered = await sut['applyFilter'](items, 'TEST')

      expect(itemsFiltered).toStrictEqual([items[0], items[1]])
      expect(spyFilterMethod).toHaveBeenCalledTimes(2)

      itemsFiltered = await sut['applyFilter'](items, 'no-filter')

      expect(itemsFiltered).toHaveLength(0)
      expect(spyFilterMethod).toHaveBeenCalledTimes(3)
    })
  })

  describe('applySort method', () => {
    it('should no sort items', async () => {
      const items = [
        new StubEntity({ name: 'b', price: 50 }),
        new StubEntity({ name: 'a', price: 50 }),
      ]

      let itemsFiltered = await sut['applySort'](items, null, null)

      expect(itemsFiltered).toStrictEqual(items)

      itemsFiltered = await sut['applySort'](items, 'price', 'asc')

      expect(itemsFiltered).toStrictEqual(items)
    })

    it('should sort items', async () => {
      const items = [
        new StubEntity({ name: 'b', price: 50 }),
        new StubEntity({ name: 'a', price: 50 }),
        new StubEntity({ name: 'c', price: 50 }),
      ]

      let itemsSorted = await sut['applySort'](items, 'name', 'asc')

      expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]])

      itemsSorted = await sut['applySort'](items, 'name', 'desc')

      expect(itemsSorted).toStrictEqual(
        [items[1], items[0], items[2]].reverse(),
      )
    })
  })

  describe('applyPaginate method', () => {
    it('should paginate items', async () => {
      const items = [
        new StubEntity({ name: 'a', price: 50 }),
        new StubEntity({ name: 'b', price: 50 }),
        new StubEntity({ name: 'c', price: 50 }),
        new StubEntity({ name: 'd', price: 50 }),
        new StubEntity({ name: 'e', price: 50 }),
      ]

      let itemsPaginated = await sut['applyPaginate'](items, 1, 2)
      expect(itemsPaginated).toStrictEqual([items[0], items[1]])

      itemsPaginated = await sut['applyPaginate'](items, 2, 2)
      expect(itemsPaginated).toStrictEqual([items[2], items[3]])

      itemsPaginated = await sut['applyPaginate'](items, 3, 2)
      expect(itemsPaginated).toStrictEqual([items[4]])

      itemsPaginated = await sut['applyPaginate'](items, 4, 2)
      expect(itemsPaginated).toStrictEqual([])
    })
  })

  describe('search method', () => {
    it('should apply only pagination when the other params are null.', async () => {
      const entity = new StubEntity({ name: 'a', price: 50 })
      const items = Array(16).fill(entity)
      sut.items = items

      const params = await sut.search(new SearchParams())

      expect(params).toStrictEqual(
        new SearchResult({
          items: Array(15).fill(entity),
          currentPage: 1,
          filter: null,
          perPage: 15,
          total: 16,
          sort: null,
          sortDir: null,
        }),
      )
    })

    it('should apply paginate and filter', async () => {
      const items = [
        new StubEntity({ name: 'test', price: 50 }),
        new StubEntity({ name: 'a', price: 50 }),
        new StubEntity({ name: 'TEST', price: 50 }),
        new StubEntity({ name: 'TeSt', price: 50 }),
      ]
      sut.items = items

      let params = await sut.search(
        new SearchParams({
          page: 1,
          perPage: 2,
          filter: 'TEST',
        }),
      )

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[0], items[2]],
          currentPage: 1,
          filter: 'TEST',
          perPage: 2,
          total: 3,
          sort: null,
          sortDir: null,
        }),
      )

      params = await sut.search(
        new SearchParams({
          filter: 'TEST',
          page: 2,
          perPage: 2,
        }),
      )

      expect(params).toStrictEqual(
        new SearchResult({
          items: [items[3]],
          currentPage: 2,
          filter: 'TEST',
          perPage: 2,
          total: 3,
          sort: null,
          sortDir: null,
        }),
      )
    })
  })
})
