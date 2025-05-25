import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { UpdateUserUseCase } from '../../update-user.usecase'

describe('UpdateUserUseCase unit tests', () => {
  let sut: UpdateUserUseCase.UseCase
  let repository: UserInMemoryRepository

  beforeEach(() => {
    repository = new UserInMemoryRepository()
    sut = new UpdateUserUseCase.UseCase(repository)
  })

  it('Should throws error when entity not found', async () => {
    expect(() => sut.execute({ id: 'fakeId', name: 'a' })).rejects.toThrow(
      new NotFoundError('Entity not found'),
    )
  })

  it('Should throws error when name not provided', async () => {
    expect(() => sut.execute({ id: 'fakeId', name: '' })).rejects.toThrow(
      new BadRequestError('Name not provided'),
    )
  })

  it('Should update a user', async () => {
    const spyUpdate = jest.spyOn(repository, 'update')
    const entity = new UserEntity(UserDataBuilder({ name: 'fake' }))
    repository.items = [entity]
    const output = await sut.execute({ id: entity.id, name: 'a' })
    expect(spyUpdate).toHaveBeenCalled()
    expect(output).toStrictEqual({
      id: entity.id,
      name: 'a',
      email: entity.email,
      password: entity.password,
      createdAt: entity.createdAt,
    })
  })
})
