import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class AppProducer {
  constructor(
    @InjectQueue('xls-convert-pdf') private readonly xlsConvertQueue: Queue,
  ) {}

  async getXlsAndCreatePdf() {
    await this.xlsConvertQueue.add({ data: 'Show de Bola' });
  }
}
