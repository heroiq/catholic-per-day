import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('authorize')
  async getAuthorize(): Promise<string> {
    return await this.auth.generateAuthLink();
  }
}
