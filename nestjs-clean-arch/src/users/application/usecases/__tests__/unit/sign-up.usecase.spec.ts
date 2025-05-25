import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { BcrypthsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { SignUpUseCase } from '../../sign-up.usecase'

describe('SignupUseCase unit tests', () => {
  let sut: SignUpUseCase.UseCase
  let repository: UserInMemoryRepository
  let hashProvider: HashProvider

  beforeEach(() => {
    repository = new UserInMemoryRepository()
    hashProvider = new BcrypthsHashProvider()
    sut = new SignUpUseCase.UseCase(repository, hashProvider)
  })

  it('Should create a user', async () => {
    const spyInsert = jest.spyOn(repository, 'insert')
    const props = UserDataBuilder({})
    const { email, password, name } = props
    const result = await sut.execute({ email, password, name })
    expect(spyInsert).toHaveBeenCalledTimes(1)
    expect(result.id).toBeDefined()
    expect(result.createdAt).toBeInstanceOf(Date)
  })

  it('Should not be able register whit same email twice', async () => {
    const props = UserDataBuilder({ email: 'a@a.com' })
    await sut.execute(props)
    expect(() => sut.execute(props)).rejects.toBeInstanceOf(ConflictError)
  })

  it('Should throws error when name are not provided', async () => {
    const props = Object.assign(UserDataBuilder({}), { name: null })

    expect(() => sut.execute(props)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('Should throws error when password are not provided', async () => {
    const props = Object.assign(UserDataBuilder({}), { password: null })

    expect(() => sut.execute(props)).rejects.toBeInstanceOf(BadRequestError)
  })

  it('Should throws error when email are not provided', async () => {
    const props = Object.assign(UserDataBuilder({}), { email: null })

    expect(() => sut.execute(props)).rejects.toBeInstanceOf(BadRequestError)
  })
})
