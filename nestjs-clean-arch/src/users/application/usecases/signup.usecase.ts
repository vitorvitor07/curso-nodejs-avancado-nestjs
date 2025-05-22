import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { BadRequestError } from '../errors/bad-request-error'

export namespace SingUpUseCase {
  export type Input = {
    name: string
    email: string
    password: string
  }

  export type Output = {
    id: string
    name: string
    email: string
    password: string
    createdAt: Date
  }

  export class UseCase {
    constructor(private readonly userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const { email, name, password } = input

      if (!email || !name || !password)
        throw new BadRequestError('Input data not provider')

      await this.userRepository.emailExists(email)

      const entity = new UserEntity(input)

      await this.userRepository.insert(entity)

      return entity.toJSON()
    }
  }
}
