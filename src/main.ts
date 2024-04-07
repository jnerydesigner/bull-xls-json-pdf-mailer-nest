import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = Number(process.env.PORT_CONTAINER);

  console.log(PORT);

  await app.listen(PORT);
}
bootstrap();
