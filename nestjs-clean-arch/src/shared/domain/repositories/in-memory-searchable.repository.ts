import { Entity } from '@/shared/domain/entities/entity'
import { InMemoryRepository } from './in-memory-repository'
import {
  SearchableRespositoryInterface,
  SearchParams,
  SearchResult,
} from './searchable-repository-contracts'

export abstract class InMemorySearchableRepository<E extends Entity>
  extends InMemoryRepository<E>
  implements SearchableRespositoryInterface<E, any, any>
{
  search(props: SearchParams): Promise<SearchResult<E>> {}

  protected abstract applyFilter(
    items: E[],
    filter: string | null,
  ): Promise<E[]>

  protected async applySort(
    items: E[],
    sort: string | null,
    sortDir: string | null,
  ): Promise<E[]> {}

  protected async applyPaginate(
    items: E[],
    page: SearchParams['page'],
    perPage: SearchParams['perPage'],
  ): Promise<E[]> {}
}
