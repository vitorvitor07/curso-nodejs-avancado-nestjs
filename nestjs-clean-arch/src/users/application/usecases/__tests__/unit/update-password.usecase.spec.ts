import { InvalidPassowordError } from '@/shared/application/errors/invalid-passoword-error'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { BcrypthsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { UpdatePassordUseCase } from '../../update-password.usecase'

describe('UpdatePasswordUseCase unit tests', () => {
  let sut: UpdatePassordUseCase.UseCase
  let repository: UserInMemoryRepository
  let hashProvider: HashProvider

  beforeEach(() => {
    repository = new UserInMemoryRepository()
    hashProvider = new BcrypthsHashProvider()
    sut = new UpdatePassordUseCase.UseCase(repository, hashProvider)
  })

  it('Should throws error when entity not found', async () => {
    expect(() =>
      sut.execute({
        id: 'fakeId',
        oldPassword: 'fakePass',
        password: 'newFakePass',
      }),
    ).rejects.toThrow(new NotFoundError('Entity not found'))
  })

  it('Should throws error when password not provided', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    repository.items = [entity]
    expect(() =>
      sut.execute({ id: entity.id, password: '', oldPassword: 'fake' }),
    ).rejects.toThrow(
      new InvalidPassowordError('Old password and new password is required'),
    )
  })

  it('Should throws error when old password not provided', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    repository.items = [entity]
    expect(() =>
      sut.execute({ id: entity.id, password: 'fake', oldPassword: '' }),
    ).rejects.toThrow(
      new InvalidPassowordError('Old password and new password is required'),
    )
  })

  it('Should throws error when old password does not match', async () => {
    const entity = new UserEntity(UserDataBuilder({ password: '123' }))
    repository.items = [entity]
    expect(() =>
      sut.execute({ id: entity.id, password: 'new', oldPassword: '124' }),
    ).rejects.toThrow(new InvalidPassowordError('Old password does not match'))
  })

  it('Should update a password', async () => {
    const hashPassword = await hashProvider.generateHash('123')
    const entity = new UserEntity(UserDataBuilder({ password: hashPassword }))
    const spyUpdatePassword = jest.spyOn(entity, 'updatePassword')
    repository.items = [entity]
    const result = await sut.execute({
      id: entity.id,
      password: 'new',
      oldPassword: '123',
    })
    expect(spyUpdatePassword).toHaveBeenCalled()
    const checkNewPassword = await hashProvider.compareHash(
      'new',
      result.password,
    )
    expect(spyUpdatePassword).toHaveBeenCalledTimes(1)
    expect(checkNewPassword).toBeTruthy()
  })
})
