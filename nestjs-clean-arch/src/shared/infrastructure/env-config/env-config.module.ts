import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces'
import { join } from 'node:path'
import { EnvConfigService } from './env-config.service'

@Module({
  imports: [ConfigModule],
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class EnvConfigModule extends ConfigModule {
  static forRoot(options?: ConfigModuleOptions): DynamicModule {
    return super.forRoot({
      ...options,
      envFilePath: [
        join(__dirname, `../../../../.env.${process.env.NODE_ENV}`),
      ],
    })
  }
}
