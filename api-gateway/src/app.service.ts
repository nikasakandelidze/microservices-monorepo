import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  UnauthorizedException,
  Logger,
  HttpStatus,
  BadGatewayException,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { ServiceDiscovery } from './serviceDiscovery.provider';
import { RateLimiter, RateLimitOutput } from './rateLimiter.provider';
import { RateLimitExceededException } from './utils/exception';
import { TokenVerificationResult } from './dto/auth.dto';

const USER_RESOURCE_TOKEN = '/api/user';
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
    } else if (req.originalUrl.startsWith('/api/')) {
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
    let result: AxiosResponse<any> = undefined;
    try {
      const nextUrl = await this.serviceDiscovery.getNextUrlForService(
        'AUTHENTICATION_SERVICE',
      );
      const fullPath = `${nextUrl}/auth/verify`;
      result = await firstValueFrom(this.httpService.post(fullPath, { token }));
    } catch (e) {
      const response = e.response as AxiosResponse;
      Logger.log(response.status, response.data.message);
      if (response.status === HttpStatus.UNAUTHORIZED) {
        throw new UnauthorizedException({
          message:
            'Specified JWT authentication token is not valid or has expired',
        });
      } else {
        throw new BadGatewayException({
          message: "Coudln't fulfill your request. Please try again later.",
        });
      }
    }
    if (result) {
      const data: TokenVerificationResult = result.data;
      if (data.verified) {
        return await this.forwardRequest(req, data);
      } else {
        throw new UnauthorizedException({
          message:
            'Specified JWT authentication token is not valid or has expired',
        });
      }
    }
  }

  async forwardRequest(req: Request, data: TokenVerificationResult) {
    const url = req.originalUrl;
    const serviceName = url.startsWith(USER_RESOURCE_TOKEN)
      ? 'AUTHENTICATION_SERVICE'
      : 'TICKET_SERVICE';
    const nextUrl = await this.serviceDiscovery.getNextUrlForService(
      serviceName,
    );
    const fullPath = `${nextUrl}${url}`;
    const method = req.method.toLowerCase();
    const body = req.body;
    try {
      if (method === 'post') {
        const result: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(fullPath, { ...body, authorId: data.id }),
        );
        return result.data;
      } else if (method === 'get') {
        const result: AxiosResponse<any> = await firstValueFrom(
          this.httpService.get(fullPath),
        );
        return result.data;
      }
    } catch (e) {
      const response = e.response as AxiosResponse;
      Logger.warn(response.status, response.data.message);
      throw new BadGatewayException({
        message: "Couldn't fulfill request. Please try again later",
      });
    }
  }
}
