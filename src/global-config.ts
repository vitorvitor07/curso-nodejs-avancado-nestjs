import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ConflictErrorFilter } from './shared/infrastructure/exceptions-filters/conflict-error/conflict-error.filter'
import { InvalidCredentialsErrorFilter } from './shared/infrastructure/exceptions-filters/invalid-credentials-error/invalid-credentials-error.filter'
import { InvalidPasswordErrorFilter } from './shared/infrastructure/exceptions-filters/invalid-password-error/invalid-password-error.filter'
import { NotFoundErrorFilter } from './shared/infrastructure/exceptions-filters/not-found-error/not-found-error.filter'
import { WrapperDataInterceptor } from './shared/infrastructure/interceptors/wrapper-data/wrapper-data.interceptor'

export function applyGlobalConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  app.useGlobalInterceptors(
    new WrapperDataInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  )
  app.useGlobalFilters(
    new ConflictErrorFilter(),
    new NotFoundErrorFilter(),
    new InvalidPasswordErrorFilter(),
    new InvalidCredentialsErrorFilter(),
  )
}
