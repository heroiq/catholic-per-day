import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('tweets')
  async tweet(@Query('date') date: string): Promise<void> {
    const runDate = !!date ? new Date(date) : null;
    await this.appService.tweetDailyReadings(runDate);
  }
}
