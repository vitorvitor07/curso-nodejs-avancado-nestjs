import { applyGlobalConfig } from '@/global-config'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/__testing__/setup-prisma.tests'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { SignInDto } from '../../dto/sign-in-user.dto'
import { BcrypthsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider'
import { UsersModule } from '../../users.module'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: UserRepository.Repository
  let signInDto: SignInDto
  let hashProvider: HashProvider
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
    hashProvider = new BcrypthsHashProvider()
  })

  beforeEach(async () => {
    signInDto = {
      email: 'a@a.com',
      password: 'test1234',
    }

    await prismaService.user.deleteMany()
  })

  afterAll(() => {
    module.close()
  })

  describe('/POST /users/login', () => {
    it('should authenticate a user', async () => {
      const passwordHash = await hashProvider.generateHash(signInDto.password)
      const entity = new UserEntity(
        UserDataBuilder({ ...signInDto, password: passwordHash }),
      )
      repository.insert(entity)
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signInDto)
        .expect(200)

      expect(Object.keys(res.body)).toStrictEqual(['accessToken'])
      expect(typeof res.body.accessToken).toEqual('string')
    })

    it('should return a error with 422 code when request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({})
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'email should not be empty',
        'email must be an email',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ])
    })

    it('should return a error with 422 code when email field is invalid', async () => {
      delete signInDto.email
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signInDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'email should not be empty',
        'email must be an email',
        'email must be a string',
      ])
    })

    it('should return a error with 422 code when password field is invalid', async () => {
      delete signInDto.password
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signInDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ])
    })

    it('should return a error with 404 code when email not found', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({ ...signInDto, email: 'fake@a.com' })
        .expect(404)
      expect(res.body.error).toBe('Not Found')
      expect(res.body.message).toEqual(
        'UserModel not found using email fake@a.com',
      )
    })

    it('should return a error with 400 code when password is incorrect', async () => {
      const passwordHash = await hashProvider.generateHash(signInDto.password)
      const entity = new UserEntity(
        UserDataBuilder({ ...signInDto, password: passwordHash }),
      )
      repository.insert(entity)

      await request(app.getHttpServer())
        .post('/users/login')
        .send({ ...signInDto, password: 'fake' })
        .expect(400)
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid credentials',
        })
    })
  })
})
