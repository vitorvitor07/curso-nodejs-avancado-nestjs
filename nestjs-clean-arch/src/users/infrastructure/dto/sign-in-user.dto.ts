import { SingInUseCase } from '@/users/application/usecases/sign-in.usecase'

export class SignInDto implements SingInUseCase.Input {
  email: string
  password: string
}
