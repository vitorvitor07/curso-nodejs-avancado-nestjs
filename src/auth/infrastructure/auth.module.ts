import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'

@Module({
  imports: [
    EnvConfigModule,
    JwtModule.registerAsync({
      imports: [EnvConfigModule],
      global: true,
      inject: [EnvConfigService],
      useFactory: async (configService: EnvConfigService) => ({
        global: true,
        secret: configService.getJwtSecret(),
        signOptions: {
          expiresIn: configService.getJwtExpiresInSeconds(),
        },
      }),
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
