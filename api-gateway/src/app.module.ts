import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiProxyService } from './provider/api.proxy.provider';
import { AuthenticationSerivce } from './provider/authentication.provider';
import { RateLimiter } from './provider/rate.imiter.provider';
import { ServiceDiscovery } from './provider/service.discovery.provider';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [
    AppService,
    ServiceDiscovery,
    RateLimiter,
    AuthenticationSerivce,
    ApiProxyService,
  ],
})
export class AppModule {}
