import { UserOutput } from '@/users/application/dto/user-output.dto'
import { GetUserUseCase } from '@/users/application/usecases/get-user.usecase'
import { ListUsersUseCase } from '@/users/application/usecases/list-users.usecase'
import { SignInUseCase } from '@/users/application/usecases/sign-in.usecase'
import { SignUpUseCase } from '@/users/application/usecases/sign-up.usecase'
import { UpdatePassordUseCase } from '@/users/application/usecases/update-password.usecase'
import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase'
import { UpdatePasswordDto } from '../../dto/update-password-user.dto'
import { UpdateUserDto } from '../../dto/update-user.dto'
import { UserCollectionPresenter } from '../../presenters/user-collection.presenter'
import { UserPresenter } from '../../presenters/user.presenter'
import { UsersController } from '../../users.controller'

describe('UsersController', () => {
  let sut: UsersController
  let id: string
  let props: UserOutput

  beforeEach(async () => {
    sut = new UsersController()
    id = 'b5d9e3fa-6b74-475b-89dd-255815e2838c'
    props = {
      id,
      name: 'test',
      email: 'a@a.com',
      password: '1234',
      createdAt: new Date(),
    }
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should create a user', async () => {
    const output: SignUpUseCase.Output = props
    const mockSignUpUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    const input: SignUpUseCase.Input = {
      name: 'test',
      email: 'a@a.com',
      password: '1234',
    }
    sut['signUpUseCase'] = mockSignUpUseCase as any
    const presenter = await sut.create(input)
    expect(presenter).toStrictEqual(new UserPresenter(output))
    expect(presenter).toBeInstanceOf(UserPresenter)
    expect(mockSignUpUseCase.execute).toHaveBeenCalledWith(input)
  })

  it('should authenticate a user', async () => {
    const output = 'fake_token'
    const mockSignInUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    const mockAuthService = {
      generateJwt: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    const input: SignInUseCase.Input = {
      email: 'a@a.com',
      password: '1234',
    }
    sut['signInUseCase'] = mockSignInUseCase as any
    sut['authService'] = mockAuthService as any
    const result = await sut.login(input)
    expect(result).toEqual(output)
    expect(mockSignInUseCase.execute).toHaveBeenCalledWith(input)
  })

  it('should update a user', async () => {
    const output: UpdateUserUseCase.Output = props
    const mockUpdateUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    const input: UpdateUserDto = {
      name: props.name,
    }
    sut['updateUserUseCase'] = mockUpdateUserUseCase as any
    const presenter = await sut.update(id, input)
    expect(presenter).toStrictEqual(new UserPresenter(output))
    expect(presenter).toBeInstanceOf(UserPresenter)
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({ id, ...input })
  })

  it('should update password', async () => {
    const output: UpdatePassordUseCase.Output = props
    const mockUpdatePasswordUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    const input: UpdatePasswordDto = {
      oldPassword: '1234',
      password: '4321',
    }
    sut['updatePasswordUseCase'] = mockUpdatePasswordUseCase as any
    const presenter = await sut.updatePasoword(id, input)
    expect(presenter).toStrictEqual(new UserPresenter(output))
    expect(presenter).toBeInstanceOf(UserPresenter)
    expect(mockUpdatePasswordUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    })
  })

  it('should delete a user', async () => {
    const output = undefined
    const mockDeleteUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['deleteUserUseCase'] = mockDeleteUserUseCase as any
    const result = await sut.remove(id)
    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({ id })
    expect(output).toStrictEqual(result)
  })

  it('should gets a user', async () => {
    const output: GetUserUseCase.Output = props
    const mockGetUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['getUserUseCase'] = mockGetUserUseCase as any
    const presenter = await sut.findOne(id)
    expect(presenter).toStrictEqual(new UserPresenter(output))
    expect(presenter).toBeInstanceOf(UserPresenter)
    expect(mockGetUserUseCase.execute).toHaveBeenCalledWith({ id })
  })

  it('should list users', async () => {
    const output: ListUsersUseCase.Output = {
      items: [props],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    }
    const searchParams = {
      pege: 1,
      perPage: 1,
    }
    const mockListUsersUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['listUsersUseCase'] = mockListUsersUseCase as any
    const presenter = await sut.search(searchParams)
    expect(presenter).toBeInstanceOf(UserCollectionPresenter)
    expect(presenter).toEqual(new UserCollectionPresenter(output))
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(searchParams)
  })
})
