import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { BcrypthsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { BadRequestError } from '../errors/bad-request-error'
import { UserOutput } from '../dto/user-output.dto'

export namespace SingUpUseCase {
  export type Input = {
    name: string
    email: string
    password: string
  }

  export type Output = UserOutput

  export class UseCase {
    constructor(
      private readonly userRepository: UserRepository.Repository,
      private readonly hashProvider: BcrypthsHashProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { email, name, password } = input

      if (!email || !name || !password)
        throw new BadRequestError('Input data not provider')

      await this.userRepository.emailExists(email)

      const hashPassword = await this.hashProvider.generateHash(password)

      const entity = new UserEntity(
        Object.assign(input, { password: hashPassword }),
      )

      await this.userRepository.insert(entity)

      return entity.toJSON()
    }
  }
}
