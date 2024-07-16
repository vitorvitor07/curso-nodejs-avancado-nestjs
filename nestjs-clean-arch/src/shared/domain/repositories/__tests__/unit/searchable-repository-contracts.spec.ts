import {
  SearchParams,
  SearchResult,
} from '../../searchable-repository-contracts'

describe('Searchable Repository unit tests', () => {
  describe('SearchParams tests', () => {
    it('page prop', () => {
      const sut = new SearchParams({})
      expect(sut.page).toBe(1)

      const params = [
        {
          page: null as any,
          expected: 1,
        },
        {
          page: undefined as any,
          expected: 1,
        },
        {
          page: '' as any,
          expected: 1,
        },
        {
          page: 'test' as any,
          expected: 1,
        },
        {
          page: 0 as any,
          expected: 1,
        },
        {
          page: -1 as any,
          expected: 1,
        },
        {
          page: 0.1 as any,
          expected: 1,
        },
        {
          page: true as any,
          expected: 1,
        },
        {
          page: false as any,
          expected: 1,
        },
        {
          page: {} as any,
          expected: 1,
        },
        {
          page: 1,
          expected: 1,
        },
        {
          page: 2,
          expected: 2,
        },
        {
          page: 25,
          expected: 25,
        },
      ]

      params.forEach(({ page, expected }) => {
        expect(new SearchParams({ page }).page).toBe(expected)
      })
    })

    it('perPage prop', () => {
      const sut = new SearchParams({})
      expect(sut.perPage).toBe(15)

      const params = [
        {
          perPage: null as any,
          expected: 15,
        },
        {
          perPage: undefined as any,
          expected: 15,
        },
        {
          perPage: '' as any,
          expected: 15,
        },
        {
          perPage: 'test' as any,
          expected: 15,
        },
        {
          perPage: 0 as any,
          expected: 15,
        },
        {
          perPage: -1 as any,
          expected: 15,
        },
        {
          perPage: 0.1 as any,
          expected: 15,
        },
        {
          perPage: true as any,
          expected: 15,
        },
        {
          perPage: false as any,
          expected: 15,
        },
        {
          perPage: {} as any,
          expected: 15,
        },
        {
          perPage: 1,
          expected: 1,
        },
        {
          perPage: 2,
          expected: 2,
        },
      ]

      params.forEach(({ perPage, expected }) => {
        expect(new SearchParams({ perPage }).perPage).toBe(expected)
      })
    })

    it('sort prop', () => {
      const sut = new SearchParams({ sort: 'test' })
      expect(sut.sort).toBe('test')

      const params = [
        { sort: null as any, expected: null },
        { sort: undefined as any, expected: null },
        { sort: '' as any, expected: null },
        { sort: 'test', expected: 'test' },
        { sort: 0, expected: '0' },
        { sort: -1, expected: '-1' },
        { sort: 5.5, expected: '5.5' },
        { sort: true, expected: 'true' },
        { sort: false, expected: 'false' },
        { sort: {}, expected: '[object Object]' },
        { sort: 1, expected: '1' },
        { sort: 2, expected: '2' },
        { sort: 25, expected: '25' },
      ]

      params.forEach(i => {
        expect(new SearchParams({ sort: i.sort }).sort).toBe(i.expected)
      })
    })

    it('sortDir prop', () => {
      let sut = new SearchParams()
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: null })
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: undefined })
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: '' })
      expect(sut.sortDir).toBeNull()

      const params = [
        { sortDir: null as any, expected: 'desc' },
        { sortDir: undefined as any, expected: 'desc' },
        { sortDir: '' as any, expected: 'desc' },
        { sortDir: 'test', expected: 'desc' },
        { sortDir: 0, expected: 'desc' },
        { sortDir: 'asc', expected: 'asc' },
        { sortDir: 'desc', expected: 'desc' },
        { sortDir: 'ASC', expected: 'asc' },
        { sortDir: 'DESC', expected: 'desc' },
      ]

      params.forEach(i => {
        expect(
          new SearchParams({ sort: 'field', sortDir: i.sortDir }).sortDir,
        ).toBe(i.expected)
      })
    })

    it('filter prop', () => {
      const sut = new SearchParams({ filter: 'test' })
      expect(sut.filter).toBe('test')

      const params = [
        { filter: null as any, expected: null },
        { filter: undefined as any, expected: null },
        { filter: '' as any, expected: null },
        { filter: 'test', expected: 'test' },
        { filter: 0, expected: '0' },
        { filter: -1, expected: '-1' },
        { filter: 5.5, expected: '5.5' },
        { filter: true, expected: 'true' },
        { filter: false, expected: 'false' },
        { filter: {}, expected: '[object Object]' },
        { filter: 1, expected: '1' },
        { filter: 2, expected: '2' },
        { filter: 25, expected: '25' },
      ]

      params.forEach(i => {
        expect(new SearchParams({ filter: i.filter }).filter).toBe(i.expected)
      })
    })
  })

  describe('SearchREsult tests', () => {
    it('contructor props', () => {
      let sut = new SearchResult({
        items: ['test1', 'test2', 'test3', 'test4'] as any,
        total: 4,
        currentPage: 1,
        perPage: 2,
        sort: null,
        sortDir: null,
        filter: null,
      })

      expect(sut.toJson()).toStrictEqual({
        items: ['test1', 'test2', 'test3', 'test4'] as any,
        total: 4,
        currentPage: 1,
        perPage: 2,
        lastPage: 2,
        sort: null,
        sortDir: null,
        filter: null,
      })

      sut = new SearchResult({
        items: ['test1', 'test2', 'test3', 'test4'] as any,
        total: 4,
        currentPage: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'test',
      })

      expect(sut.toJson()).toStrictEqual({
        items: ['test1', 'test2', 'test3', 'test4'] as any,
        total: 4,
        currentPage: 1,
        perPage: 2,
        lastPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'test',
      })

      sut = new SearchResult({
        items: ['test1', 'test2', 'test3', 'test4'] as any,
        total: 4,
        currentPage: 1,
        perPage: 10,
        sort: 'name',
        sortDir: 'asc',
        filter: 'test',
      })

      expect(sut.lastPage).toBe(1)

      sut = new SearchResult({
        items: ['test1', 'test2', 'test3', 'test4'] as any,
        total: 54,
        currentPage: 1,
        perPage: 10,
        sort: 'name',
        sortDir: 'asc',
        filter: 'test',
      })

      expect(sut.lastPage).toBe(6)
    })
  })
})
