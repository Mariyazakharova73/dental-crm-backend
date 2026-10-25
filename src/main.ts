import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    exposedHeaders: ['X-Total-Count'],
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3002);
}
void bootstrap();
