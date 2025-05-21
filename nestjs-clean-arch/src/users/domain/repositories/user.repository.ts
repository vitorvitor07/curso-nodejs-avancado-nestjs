import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchableRespositoryInterface,
} from '@/shared/domain/repositories/searchable-repository-contracts'
import { UserEntity } from '../entities/user.entity'

export namespace UserRepository {
  export type Filter = string

  export class SearchParams extends DefaultSearchParams<Filter> {}

  export class SearchResult extends DefaultSearchResult<UserEntity, Filter> {}

  export interface Repository
    extends SearchableRespositoryInterface<
      UserEntity,
      Filter,
      SearchParams,
      SearchResult
    > {
    findByEmail(email: string): Promise<UserEntity>
    emailExists(email: string): Promise<void>
  }
}
