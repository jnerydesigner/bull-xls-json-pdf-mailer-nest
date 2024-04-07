import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppProducer } from './app.producer';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appProducer: AppProducer,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('games')
  async getGames() {
    await this.appProducer.getXlsAndCreatePdf();
  }
}
