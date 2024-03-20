import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EnvConfigModule } from './shared/infrastructure/env-config/env-config.module'
import { UsersModule } from './users/infrastructure/users.module'

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [EnvConfigModule, AppService],
})
export class AppModule {}
