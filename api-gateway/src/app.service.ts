import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { ServiceDiscovery } from './serviceDiscovery';
import { RateLimiter, RateLimitOutput } from './rateLimiter';
import { RateLimitExceededException } from './utils/exception';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly serviceDiscovery: ServiceDiscovery,
    private readonly rateLimiter: RateLimiter,
  ) {}

  async handleApiGatewayRequest(req: Request) {
    const rateLimitOutput: RateLimitOutput =
      await this.rateLimiter.throttleRequest({
        id: req.ip,
      });
    if (rateLimitOutput.throttled) {
      throw new RateLimitExceededException(rateLimitOutput.metadata);
    }
    if (
      req.originalUrl === '/api/auth/register' ||
      req.originalUrl === '/api/auth/login'
    ) {
      return this.handleAuthenticationEndpoints(req);
    }
    if (req.originalUrl.startsWith('/api/v1/')) {
      return this.handleRestricedResourceAccess(req);
    }
  }

  private async handleAuthenticationEndpoints(
    req: Request,
  ): Promise<{ token: string }> {
    const path = req.originalUrl.split('/').slice(2).join('/');
    try {
      const nextUrl = await this.serviceDiscovery.getNextUrlForService(
        'AUTHENTICATION_SERVICE',
      );
      const fullPath = `${nextUrl}/${path}`;
      const body = req.body;
      const result: AxiosResponse<{ token: string }> = await firstValueFrom(
        this.httpService.post(fullPath, body),
      );
      return result.data;
    } catch (e) {
      Logger.error(e);
      throw new UnauthorizedException();
    }
  }

  // Let's assume for now that each and every endpoint that exists in different microservices need auth token
  private async handleRestricedResourceAccess(req: Request): Promise<any> {
    const authToken =
      req.header('Authorization') || req.header('authorization');
    if (!authToken) {
      throw new UnauthorizedException();
    }
    const [bearer, token] = authToken.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }
    try {
      const nextUrl = await this.serviceDiscovery.getNextUrlForService(
        'AUTHENTICATION_SERVICE',
      );
      const fullPath = `${nextUrl}/auth/verify`;
      const result: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(fullPath, { token }),
      );
      const data = result.data;
      if (data.verified) {
        return { verified: true };
      }
    } catch (e) {
      Logger.warn(e);
      throw new UnauthorizedException();
    }
  }
}
