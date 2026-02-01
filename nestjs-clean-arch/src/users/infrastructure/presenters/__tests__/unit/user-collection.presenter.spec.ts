import { PaginationPresenter } from '@/shared/infrastructure/presenter/pagination.presenter'
import { instanceToPlain } from 'class-transformer'
import { UserCollectionPresenter } from '../../user-collection.presenter'
import { UserPresenter } from '../../user.presenter'

describe('UserCollectionPresenter unit tests', () => {
  const createdAt = new Date()
  const props = {
    id: '310711f1-073b-461a-aa33-7ed0b0bac525',
    name: 'test name',
    password: 'fake',
    email: 'a@a.com',
    createdAt,
  }

  describe('constructor', () => {
    it('should set values', () => {
      const sut = new UserCollectionPresenter({
        items: [props],
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      })
      expect(sut.meta).toBeInstanceOf(PaginationPresenter)
      expect(sut.meta).toStrictEqual(
        new PaginationPresenter({
          currentPage: 1,
          perPage: 2,
          lastPage: 1,
          total: 1,
        }),
      )
      expect(sut.data).toStrictEqual([new UserPresenter(props)])
    })
  })

  it('should presenter data', () => {
    let sut = new UserCollectionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 1,
    })
    let output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      data: [
        {
          id: '310711f1-073b-461a-aa33-7ed0b0bac525',
          name: 'test name',
          email: 'a@a.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      },
    })
    sut = new UserCollectionPresenter({
      items: [props],
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '1' as any,
      total: '1' as any,
    })
    output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      data: [
        {
          id: '310711f1-073b-461a-aa33-7ed0b0bac525',
          name: 'test name',
          email: 'a@a.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      },
    })
  })
})
