import { UpdatePassordUseCase } from '@/users/application/usecases/update-password.usecase'

export class UpdatePasswordUserDto
  implements Omit<UpdatePassordUseCase.Input, 'id'>
{
  password: string
  oldPassword: string
}
