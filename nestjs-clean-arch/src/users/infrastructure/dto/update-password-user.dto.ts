import { UpdatePassordUseCase } from '@/users/application/usecases/update-password.usecase'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdatePasswordDto
  implements Omit<UpdatePassordUseCase.Input, 'id'>
{
  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  @IsNotEmpty()
  oldPassword: string
}
