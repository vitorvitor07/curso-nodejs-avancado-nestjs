import { InvalidPassowordError } from '@/shared/application/errors/invalid-passoword-error'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput, UserOutputMapper } from '../dto/user-output.dto'

export namespace UpdatePassordUseCase {
  export type Input = {
    id: string
    password: string
    oldPassword: string
  }

  export type Output = UserOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly userRepository: UserRepository.Repository,
      private readonly hashProvider: HashProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.userRepository.findById(input.id)
      if (!input.password || !input.oldPassword)
        throw new InvalidPassowordError(
          'Old password and new password is required',
        )
      const checkOldPassword = await this.hashProvider.compareHash(
        input.oldPassword,
        entity.password,
      )
      if (!checkOldPassword)
        throw new InvalidPassowordError('Old password does not match')

      const hashPassword = await this.hashProvider.generateHash(input.password)
      entity.updatePassword(hashPassword)
      await this.userRepository.update(entity)
      return UserOutputMapper.toOutput(entity)
    }
  }
}
