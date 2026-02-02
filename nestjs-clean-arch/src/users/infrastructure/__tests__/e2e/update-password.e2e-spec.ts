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
    updatePasswordDto = {
      oldPassword: 'oldpass',
      password: 'newpass',
    }
    await prismaService.user.deleteMany()
    const hashPassword = await hashProvider.generateHash('oldpass')
    entity = new UserEntity(UserDataBuilder({ password: hashPassword }))
    await repository.insert(entity)
  })

  afterAll(() => {
    module.close()
  })

  describe('/PATCH /users', () => {
    it('should updated a password', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity._id}`)
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

    // it('should return a error with 422 code when name field is invalid', async () => {
    //   delete updatePasswordDto.oldPassword
    //   const res = await request(app.getHttpServer())
    //     .post('/users')
    //     .send(updatePasswordDto)
    //     .expect(422)
    //   expect(res.body.error).toBe('Unprocessable Entity')
    //   expect(res.body.message).toEqual([
    //     'name should not be empty',
    //     'name must be a string',
    //   ])
    // })
    // it('should return a error with 422 code when email field is invalid', async () => {
    //   delete updatePasswordDto.email
    //   const res = await request(app.getHttpServer())
    //     .post('/users')
    //     .send(updatePasswordDto)
    //     .expect(422)
    //   expect(res.body.error).toBe('Unprocessable Entity')
    //   expect(res.body.message).toEqual([
    //     'email should not be empty',
    //     'email must be an email',
    //     'email must be a string',
    //   ])
    // })

    // it('should return a error with 422 code when password field is invalid', async () => {
    //   delete updatePasswordDto.password
    //   const res = await request(app.getHttpServer())
    //     .post('/users')
    //     .send(updatePasswordDto)
    //     .expect(422)
    //   expect(res.body.error).toBe('Unprocessable Entity')
    //   expect(res.body.message).toEqual([
    //     'password should not be empty',
    //     'password must be a string',
    //   ])
    // })

    // it('should return a error with 422 code with invalid field provided', async () => {
    //   const res = await request(app.getHttpServer())
    //     .post('/users')
    //     .send(Object.assign(updatePasswordDto, { xpto: 'fake' }))
    //     .expect(422)
    //   expect(res.body.error).toBe('Unprocessable Entity')
    //   expect(res.body.message).toEqual(['property xpto should not exist'])
    // })

    // it('should return a error with 409 code when email is duplicated', async () => {
    //   const entity = new UserEntity(UserDataBuilder({ ...updatePasswordDto }))
    //   await repository.insert(entity)
    //   await request(app.getHttpServer())
    //     .post('/users')
    //     .send(updatePasswordDto)
    //     .expect(409)
    //     .expect({
    //       statusCode: 409,
    //       error: 'Conflict',
    //       message: 'Email address already used',
    //     })
    // })
  })
})
