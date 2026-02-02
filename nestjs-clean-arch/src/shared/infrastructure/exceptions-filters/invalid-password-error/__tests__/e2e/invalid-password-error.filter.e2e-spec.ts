import { InvalidPasswordError } from '@/shared/application/errors/invalid-passoword-error'
import { InvalidPasswordErrorFilter } from '../../invalid-password-error.filter'

import { Controller, Get, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new InvalidPasswordError('passoword does not match')
  }
}

describe('InvalidPasswordErrorFilter (e2e)', () => {
  let app: INestApplication
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile()
    app = module.createNestApplication()
    app.useGlobalFilters(new InvalidPasswordErrorFilter())
    await app.init()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(new InvalidPasswordErrorFilter()).toBeDefined()
  })

  it('should catch a InvalidPasswordError', () => {
    return request(app.getHttpServer()).get('/stub').expect(422).expect({
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'passoword does not match',
    })
  })
})
