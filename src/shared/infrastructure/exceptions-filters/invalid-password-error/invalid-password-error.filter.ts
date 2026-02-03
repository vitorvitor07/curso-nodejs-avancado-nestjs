import { InvalidPasswordError } from '@/shared/application/errors/invalid-passoword-error'
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { FastifyReply } from 'fastify'

@Catch(InvalidPasswordError)
export class InvalidPasswordErrorFilter implements ExceptionFilter {
  catch(exception: InvalidPasswordError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()

    return response.status(422).send({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: exception.message,
    })
  }
}
