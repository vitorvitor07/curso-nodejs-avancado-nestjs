import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { Controller, Get, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { ConflictErrorFilter } from '../../conflict-error.filter'

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new ConflictError('Conflict data')
  }
}

describe('ConflictErrorFilter (e2e)', () => {
  let app: INestApplication
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile()
    app = module.createNestApplication()
    app.useGlobalFilters(new ConflictErrorFilter())
    await app.init()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(new ConflictErrorFilter()).toBeDefined()
  })

  it('should catch a ConflictError', () => {
    return request(app.getHttpServer()).get('/stub').expect(409).expect({
      statusCode: 409,
      error: 'Conflict',
      message: 'Conflict data',
    })
  })
})
