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
import { UpdatePasswordDto } from '../../dto/update-password-user.dto'
import { BcrypthsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider'
import { UsersModule } from '../../users.module'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: UserRepository.Repository
  let updatePasswordDto: UpdatePasswordDto
  const prismaService = new PrismaClient()
  let hashProvider: HashProvider
  let entity: UserEntity
  let accessToken: string

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

    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: 'a@a.com',
        password: 'oldpass',
      })
      .expect(200)

    accessToken = loginResponse.body.accessToken
  })

  beforeEach(async () => {
    updatePasswordDto = {
      oldPassword: 'oldpass',
      password: 'newpass',
    }
    await prismaService.user.deleteMany()
    const hashPassword = await hashProvider.generateHash('oldpass')
    entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword }),
    )
    await repository.insert(entity)
  })

  afterAll(() => {
    module.close()
  })

  describe('/PATCH /users', () => {
    it('should updated a password', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(200)

      expect(Object.keys(res.body)).toStrictEqual(['data'])

      const user = await repository.findById(res.body.data.id)
      const checkNewPassword = await hashProvider.compareHash(
        'newpass',
        user.password,
      )
      expect(checkNewPassword).toBeTruthy()
    })

    it('should return a error with 422 code when request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
        'oldPassword should not be empty',
        'oldPassword must be a string',
      ])
    })

    it('should return a error with 404 code when throw NorFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(404)
      expect(res.body.error).toBe('Not Found')
      expect(res.body.message).toEqual(`UserModel not found using ID fakeId`)
    })

    it('should return a error with 422 code when password field is invalid', async () => {
      delete updatePasswordDto.password
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ])
    })

    it('should return a error with 422 code when oldPassword field is invalid', async () => {
      delete updatePasswordDto.oldPassword
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'oldPassword should not be empty',
        'oldPassword must be a string',
      ])
    })

    it('should return a error with 422 code when password does not match', async () => {
      updatePasswordDto.oldPassword = 'fake'
      await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatePasswordDto)
        .expect(422)
        .expect({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Old password does not match',
        })
    })

    it('should return a error with 401 when the request is not authorized', async () => {
      await request(app.getHttpServer())
        .patch(`/users/fake-id`)
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        })
    })
  })
})
