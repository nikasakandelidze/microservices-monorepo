import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RateLimiter } from './rateLimiter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4001);
  await app.get(RateLimiter).init();
}
bootstrap();
