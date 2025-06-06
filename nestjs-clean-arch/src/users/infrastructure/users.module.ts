import { HashProvider } from '@/shared/application/providers/hash-provider'
import { Module } from '@nestjs/common'
import { DeleteUserUseCase } from '../application/usecases/delete-user.usecase'
import { GetUserUseCase } from '../application/usecases/get-user.usecase'
import { ListUsersUseCase } from '../application/usecases/list-users.usecase'
import { SignInUseCase } from '../application/usecases/sign-in.usecase'
import { SignUpUseCase } from '../application/usecases/sign-up.usecase'
import { UpdatePassordUseCase } from '../application/usecases/update-password.usecase'
import { UpdateUserUseCase } from '../application/usecases/update-user.usecase'
import { UserRepository } from '../domain/repositories/user.repository'
import { UserInMemoryRepository } from './database/in-memory/repositories/user-in-memory.repository'
import { BcrypthsHashProvider } from './providers/hash-provider/bcryptjs-hash.provider'
import { UsersController } from './users.controller'

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: 'UserRepository',
      useClass: UserInMemoryRepository,
    },
    {
      provide: 'HashProvider',
      useClass: BcrypthsHashProvider,
    },
    {
      provide: SignUpUseCase.UseCase,
      inject: ['UserRepository', 'HashProvider'],
      useFactory: (
        userRepository: UserRepository.Repository,
        hashProvider: HashProvider,
      ) => {
        return new SignUpUseCase.UseCase(userRepository, hashProvider)
      },
    },
    {
      provide: SignInUseCase.UseCase,
      inject: ['UserRepository', 'HashProvider'],
      useFactory: (
        userRepository: UserRepository.Repository,
        hashProvider: HashProvider,
      ) => {
        return new SignInUseCase.UseCase(userRepository, hashProvider)
      },
    },
    {
      provide: GetUserUseCase.UseCase,
      inject: ['UserRepository'],
      useFactory: (userRepository: UserRepository.Repository) => {
        return new GetUserUseCase.UseCase(userRepository)
      },
    },
    {
      provide: ListUsersUseCase.UseCase,
      inject: ['UserRepository'],
      useFactory: (userRepository: UserRepository.Repository) => {
        return new ListUsersUseCase.UseCase(userRepository)
      },
    },
    {
      provide: UpdateUserUseCase.UseCase,
      inject: ['UserRepository'],
      useFactory: (userRepository: UserRepository.Repository) => {
        return new UpdateUserUseCase.UseCase(userRepository)
      },
    },
    {
      provide: UpdatePassordUseCase.UseCase,
      inject: ['UserRepository', 'HashProvider'],
      useFactory: (
        userRepository: UserRepository.Repository,
        hashProvider: HashProvider,
      ) => {
        return new UpdatePassordUseCase.UseCase(userRepository, hashProvider)
      },
    },
    {
      provide: DeleteUserUseCase.UseCase,
      inject: ['UserRepository'],
      useFactory: (userRepository: UserRepository.Repository) => {
        return new DeleteUserUseCase.UseCase(userRepository)
      },
    },
  ],
})
export class UsersModule {}
