import { UserOutput } from '@/users/application/dto/user-output.dto'
import { SignUpUseCase } from '@/users/application/usecases/sign-up.usecase'
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
})
