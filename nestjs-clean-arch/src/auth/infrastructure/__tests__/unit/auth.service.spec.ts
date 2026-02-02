import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { ConfigService } from '@nestjs/config'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../../auth.service'

describe('AuthService', () => {
  let sut: AuthService
  let module: TestingModule
  let jwtService: JwtService
  let envConfigService: EnvConfigService
  let configService: ConfigService

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [EnvConfigModule, JwtModule],
      providers: [AuthService],
    }).compile()
  })

  beforeEach(async () => {
    jwtService = new JwtService({
      global: true,
      secret: 'fake_secret',
      signOptions: { expiresIn: 86400, subject: 'fakeId' },
    })

    configService = new ConfigService()

    envConfigService = new EnvConfigService(configService)

    sut = new AuthService(jwtService, envConfigService)
  })

  beforeAll(() => module.close())

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should return a jwt', async () => {
    const result = await sut.generateJwt('fakeId')
    expect(Object.keys(result)).toStrictEqual(['accessToken'])
    expect(typeof result.accessToken).toEqual('string')
  })

  it('should verify a jwt', async () => {
    const result = await sut.generateJwt('fakeId')
    const validToken = await sut.verifyJwt(result.accessToken)
    expect(validToken).not.toBeNull()
    await expect(sut.verifyJwt('fake')).rejects.toThrow()
    await expect(
      sut.verifyJwt(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
      ),
    ).rejects.toThrow()
  })
})
