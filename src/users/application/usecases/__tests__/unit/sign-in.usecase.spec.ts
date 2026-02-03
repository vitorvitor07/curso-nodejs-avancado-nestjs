import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { BcrypthsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { SignInUseCase } from '../../sign-in.usecase'

describe('SigninUseCase unit tests', () => {
  let sut: SignInUseCase.UseCase
  let repository: UserInMemoryRepository
  let hashProvider: HashProvider

  beforeEach(() => {
    repository = new UserInMemoryRepository()
    hashProvider = new BcrypthsHashProvider()
    sut = new SignInUseCase.UseCase(repository, hashProvider)
  })

  it('Should create a user', async () => {
    const spyInsert = jest.spyOn(repository, 'findByEmail')
    const hashPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(
      UserDataBuilder({ password: hashPassword, email: 'a@a.com' }),
    )
    repository.items = [entity]
    const result = await sut.execute({ email: entity.email, password: '1234' })
    expect(spyInsert).toHaveBeenCalledTimes(1)
    expect(result).toStrictEqual(entity.toJSON())
  })

  it('Should throws error when password are not provided', async () => {
    const props = Object.assign(UserDataBuilder({}), { password: null })

    expect(() => sut.execute(props)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('Should throws error when email are not provided', async () => {
    const props = Object.assign(UserDataBuilder({}), { email: null })

    expect(() => sut.execute(props)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('Should not be able authenticate with wrong password', async () => {
    const hashPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword }),
    )
    repository.items = [entity]

    await expect(() =>
      sut.execute({ email: 'a@a.com', password: 'fake' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
