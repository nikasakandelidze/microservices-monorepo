import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { RateLimiter, RateLimitOutput } from './provider/rate.imiter.provider';
import { RateLimitExceededException } from './utils/exception';
import { AuthenticationSerivce } from './provider/authentication.provider';
import { ApiProxyService } from './provider/api.proxy.provider';

@Injectable()
export class AppService {
  constructor(
    private readonly rateLimiter: RateLimiter,
    private readonly authenticationService: AuthenticationSerivce,
    private readonly apiProxyService: ApiProxyService,
  ) {}

  async handleApiGatewayRequest(req: Request) {
    const rateLimitOutput: RateLimitOutput =
      await this.rateLimiter.throttleRequest({
        id: req.ip,
      });
    if (rateLimitOutput.throttled) {
      throw new RateLimitExceededException(rateLimitOutput.metadata);
    }
    if (this.authenticationService.isAuthenticatable(req.originalUrl)) {
      return await this.authenticationService.handleAuthentication(
        req.originalUrl,
        req.body,
      );
    } else if (this.apiProxyService.isUrlForwardable(req.originalUrl)) {
      return this.apiProxyService.handleForwardRequest(
        req.originalUrl,
        req.method.toLowerCase(),
        req.headers,
        req.body,
      );
    } else {
      throw new NotFoundException();
    }
  }
}
