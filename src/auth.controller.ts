import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('authorize')
  async getAuthorize(): Promise<string> {
    return await this.auth.generateAuthLink();
  }

  @Get('twitter-callback')
  async handleCallback(
    @Query('state') state: string,
    @Query('code') code: string,
  ): Promise<string> {
    try {
      await this.auth.handleCallback(state, code);
      return 'success';
    } catch (error) {
      return error;
    }
  }
}
