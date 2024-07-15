import { Entity } from '@/shared/domain/entities/entity'
import { InMemoryRepository } from './in-memory-repository'
import { SearchableRespositoryInterface } from './searchable-repository-contracts'

export abstract class InMemorySearchableRepository<E extends Entity>
  extends InMemoryRepository<E>
  implements SearchableRespositoryInterface<E, any, any>
{
  search(props: any): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
