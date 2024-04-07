import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AppProducer } from './app.producer';
import { AppConsumer } from './app.consumer';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
        password: 'Redis2019!',
      },
    }),
    BullModule.registerQueue({
      name: 'xls-convert-pdf',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppProducer, AppConsumer],
})
export class AppModule {}
