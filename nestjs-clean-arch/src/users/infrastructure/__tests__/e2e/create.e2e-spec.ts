import { applyGlobalConfig } from '@/global-config'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/__testing__/setup-prisma.tests'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { instanceToPlain } from 'class-transformer'
import request from 'supertest'
import { SignUpDto } from '../../dto/sign-up-user.dto'
import { UsersController } from '../../users.controller'
import { UsersModule } from '../../users.module'

describe('POST /users', () => {
  let app: INestApplication
  let module: TestingModule
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: UserRepository.Repository
  let signUpDto: SignUpDto
  const prismaService = new PrismaClient()

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile()
    app = module.createNestApplication()
    applyGlobalConfig(app)
    app.init()
    repository = module.get<UserRepository.Repository>('UserRepository')
  })

  beforeEach(async () => {
    signUpDto = {
      name: 'test name',
      email: 'a@a.com',
      password: 'test1234',
    }

    await prismaService.user.deleteMany()
  })

  afterAll(() => {
    module.close()
  })

  it('should create user', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send(signUpDto)
      .expect(201)

    expect(Object.keys(res.body)).toStrictEqual(['data'])

    const user = await repository.findById(res.body.data.id)
    const presenter = UsersController.userToResponse(user.toJSON())
    const serialized = instanceToPlain(presenter)
    expect(res.body.data).toStrictEqual(serialized)
  })

  it('should return a error with 422 code when body is invalid', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({})
      .expect(422)
    expect(res.body.error).toBe('Unprocessable Entity')
    expect(res.body.message).toEqual([
      'name should not be empty',
      'name must be a string',
      'email should not be empty',
      'email must be an email',
      'email must be a string',
      'password should not be empty',
      'password must be a string',
    ])
  })
})
