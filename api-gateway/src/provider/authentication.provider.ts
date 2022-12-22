import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ServiceDiscovery } from './service.discovery.provider';

@Injectable()
export class AuthenticationSerivce {
  private static authenticationUrls = ['/api/auth/register', '/api/auth/login'];
  constructor(
    private readonly httpService: HttpService,
    private readonly serviceDiscovery: ServiceDiscovery,
  ) {}

  isAuthenticatable(url: string): boolean {
    return AuthenticationSerivce.isAuthenticatable(url);
  }

  static isAuthenticatable(url: string): boolean {
    return AuthenticationSerivce.authenticationUrls.includes(url);
  }

  async handleAuthentication(
    url: string,
    body: any,
  ): Promise<{ token: string }> {
    const path = url.split('/').slice(2).join('/');
    try {
      const nextUrl = await this.serviceDiscovery.getNextUrlForService(
        'AUTHENTICATION_SERVICE',
      );
      const fullPath = `${nextUrl}/${path}`;
      const result: AxiosResponse<{ token: string }> = await firstValueFrom(
        this.httpService.post(fullPath, body),
      );
      return result.data;
    } catch (e) {
      const response = e.response as AxiosResponse;
      Logger.warn(response.data.message);
      throw new UnauthorizedException({ message: response.data.message });
    }
  }
}
