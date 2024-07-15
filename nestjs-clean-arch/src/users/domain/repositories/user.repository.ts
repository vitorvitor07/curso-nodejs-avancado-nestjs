import { SearchableRespositoryInterface } from '@/shared/domain/repositories/searchable-repository-contracts'
import { UserEntity } from '../entities/user.entity'

export interface UserRepository
  extends SearchableRespositoryInterface<UserEntity, any, any> {
  findByEmail(email: string): Promise<UserEntity> // can throw conflict error
  emailExists(email: string): Promise<void> // can throw conflict error
}
