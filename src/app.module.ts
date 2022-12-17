import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerMiddleware } from './commons/logger';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
