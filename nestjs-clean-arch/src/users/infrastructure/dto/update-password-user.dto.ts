import { UpdatePassordUseCase } from '@/users/application/usecases/update-password.usecase'

export class UpdatePasswordDto
  implements Omit<UpdatePassordUseCase.Input, 'id'>
{
  password: string
  oldPassword: string
}
