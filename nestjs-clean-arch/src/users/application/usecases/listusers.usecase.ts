import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@/shared/application/dto/pagination-output'
import { SearchInput } from '@/shared/application/dto/search-input'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput, UserOutputMapper } from '../dto/user-output.dto'

export namespace ListUsersUseCase {
  export type Input = SearchInput

  export type Output = PaginationOutput<UserOutput>

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private readonly userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const param = new UserRepository.SearchParams(input)
      const searchResult = await this.userRepository.search(param)
      return this.toOutput(searchResult)
    }

    private toOutput(searchResult: UserRepository.SearchResult): Output {
      const items = searchResult.items.map(item =>
        UserOutputMapper.toOutput(item),
      )
      return PaginationOutputMapper.toOutput(items, searchResult)
    }
  }
}
