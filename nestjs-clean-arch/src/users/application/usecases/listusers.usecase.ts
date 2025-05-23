import { SearchInput } from '@/shared/application/dto/search-input'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { UserRepository } from '@/users/domain/repositories/user.repository'

export namespace ListUsersUseCase {
  export type Input = SearchInput

  export type Output = void

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private readonly userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const param = new UserRepository.SearchParams(input)
      const searchResult = await this.userRepository.search(param)
      return
    }
  }
}
