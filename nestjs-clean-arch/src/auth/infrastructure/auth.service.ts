import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

type GeneratedJwtProps = {
  acessToken: string
}
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: EnvConfigService,
  ) {}

  async generateJwt(userId: string): Promise<GeneratedJwtProps> {
    const acessToken = await this.jwtService.signAsync(userId, {})
    return { acessToken }
  }

  async verifyJwt(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.getJwtSecret(),
    })
  }
}
