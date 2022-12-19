import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { ServiceDiscovery } from './serviceDiscovery';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly serviceDiscovery: ServiceDiscovery,
  ) {}

  async handleApiGatewayRequest(req: Request) {
    if (
      req.originalUrl === '/api/auth/register' ||
      req.originalUrl === '/api/auth/login'
    ) {
      return await this.handleAuthenticationEndpoints(req);
    }
  }

  private async handleAuthenticationEndpoints(req: Request): Promise<any> {
    const path = req.originalUrl.split('/').slice(2).join('/');
    try {
      const nextUrl = await this.serviceDiscovery.getNextUrlForService(
        'AUTHENTICATION_SERVICE',
      );
      const fullPath = `${nextUrl}/${path}`;
      const body = req.body;
      const result: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(fullPath, body),
      );
      return result.data;
    } catch (e) {
      Logger.error(e);
      throw new UnauthorizedException();
    }
  }
}
