import { Entity } from '@/shared/domain/entities/entity'
import { RespositoryInterface } from './repository-contracts'

export interface SearchableRespositoryInterface<
  E extends Entity,
  SearchInput,
  SearchOutput,
> extends RespositoryInterface<E> {
  search(props: SearchInput): Promise<SearchOutput>
}
