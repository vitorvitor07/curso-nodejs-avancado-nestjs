import { HashProvider } from '@/shared/application/providers/hash-provider'
import { Module } from '@nestjs/common'
import { SingUpUseCase } from '../application/usecases/sign-up.usecase'
import { UserRepository } from '../domain/repositories/user.repository'
import { UserInMemoryRepository } from './database/in-memory/repositories/user-in-memory.repository'
import { BcrypthsHashProvider } from './providers/hash-provider/bcryptjs-hash.provider'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'UserRepository',
      useClass: UserInMemoryRepository,
    },
    {
      provide: 'HashProvider',
      useClass: BcrypthsHashProvider,
    },
    {
      provide: SingUpUseCase.UseCase,
      inject: ['UserRepository', 'HashProvider'],
      useFactory: (
        userRepository: UserRepository.Repository,
        hashProvider: HashProvider,
      ) => {
        return new SingUpUseCase.UseCase(userRepository, hashProvider)
      },
    },
  ],
})
export class UsersModule {}
