import { UserOutput } from '@/users/application/dto/user-output.dto'
import { SignInUseCase } from '@/users/application/usecases/sign-in.usecase'
import { SignUpUseCase } from '@/users/application/usecases/sign-up.usecase'
import { UpdatePassordUseCase } from '@/users/application/usecases/update-password.usecase'
import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase'
import { UpdatePasswordDto } from '../../dto/update-password-user.dto'
import { UpdateUserDto } from '../../dto/update-user.dto'
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
    const result = await sut.create(input)
    expect(mockSignUpUseCase.execute).toHaveBeenCalledWith(input)
    expect(output).toStrictEqual(result)
  })

  it('should authenticate a user', async () => {
    const output: SignInUseCase.Output = props
    const mockSignInUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    const input: SignInUseCase.Input = {
      email: 'a@a.com',
      password: '1234',
    }
    sut['signInUseCase'] = mockSignInUseCase as any
    const result = await sut.login(input)
    expect(mockSignInUseCase.execute).toHaveBeenCalledWith(input)
    expect(output).toStrictEqual(result)
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
    const result = await sut.update(id, input)
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({ id, ...input })
    expect(output).toStrictEqual(result)
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
    const result = await sut.updatePasoword(id, input)
    expect(mockUpdatePasswordUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    })
    expect(output).toStrictEqual(result)
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
})
