import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RateLimiter } from './rateLimiter.provider';

const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  await app.get(RateLimiter).init();
}
bootstrap();
