import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { BcrypthsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { BadRequestError } from '../../../shared/application/errors/bad-request-error'
import { UserOutput, UserOutputMapper } from '../dto/user-output.dto'

export namespace SignInUseCase {
  export type Input = {
    email: string
    password: string
  }

  export type Output = UserOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly userRepository: UserRepository.Repository,
      private readonly hashProvider: BcrypthsHashProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { email, password } = input

      if (!email || !password)
        throw new BadRequestError('Input data not provider')

      const entity = await this.userRepository.findByEmail(email)

      const hashPassowrdMatches = await this.hashProvider.compareHash(
        password,
        entity.password,
      )

      if (!hashPassowrdMatches)
        throw new InvalidCredentialsError('Invalid credentials')

      return UserOutputMapper.toOutput(entity)
    }
  }
}
