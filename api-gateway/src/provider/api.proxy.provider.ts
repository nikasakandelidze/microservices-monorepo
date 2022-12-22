import {
  BadGatewayException,
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationSerivce } from './authentication.provider';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { TokenVerificationResult } from 'src/dto/auth.dto';
import { HttpService } from '@nestjs/axios';
import { ServiceDiscovery } from './service.discovery.provider';
import { IncomingHttpHeaders } from 'http';

const USER_RESOURCE_TOKEN = '/api/user';

@Injectable()
export class ApiProxyService {
  // this list should be dynamically updated depending on the actual services/urls added/removed from the system
  private potentialUrlStarts = [
    '/api/ticket',
    '/api/user',
    '/api/sprint',
    '/api/comment',
    '/api/project',
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly serviceDiscovery: ServiceDiscovery,
  ) {}

  isUrlForwardable(url: string): boolean {
    return (
      this.isKnownUrl(url) && !AuthenticationSerivce.isAuthenticatable(url)
    );
  }

  async handleForwardRequest(
    url: string,
    method: string,
    headers: IncomingHttpHeaders,
    body: any,
  ) {
    const [bearer, token] = this.extractToken(headers);
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
      } else if (response.status === HttpStatus.BAD_REQUEST) {
        throw new BadRequestException({ message: response.data.message });
      } else {
        throw new BadGatewayException({
          message: "Coudln't fullfil your request. Please try again later.",
        });
      }
    }
    if (result) {
      const data: TokenVerificationResult = result.data;
      if (data.verified) {
        return await this.forwardRequest(url, method, body, data);
      } else {
        throw new UnauthorizedException({
          message:
            'Specified JWT authentication token is not valid or has expired',
        });
      }
    }
  }

  private isKnownUrl(url: string): boolean {
    return this.potentialUrlStarts.some((prefix) => url.startsWith(prefix));
  }

  private extractToken(headers: IncomingHttpHeaders) {
    const authToken = headers.authorization;
    if (!authToken) {
      throw new UnauthorizedException();
    }
    const [bearer, token] = authToken.split(' ');
    return [bearer, token];
  }

  private async forwardRequest(
    url: string,
    method: string,
    body: any,
    tokenVerificationResult: TokenVerificationResult,
  ) {
    const serviceName = url.startsWith(USER_RESOURCE_TOKEN)
      ? 'AUTHENTICATION_SERVICE'
      : 'TICKET_SERVICE';
    const nextUrl = await this.serviceDiscovery.getNextUrlForService(
      serviceName,
    );
    const fullPath = `${nextUrl}${url}`;
    try {
      if (method === 'post') {
        const result: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(fullPath, {
            ...body,
            authorId: tokenVerificationResult.id, //this is default extension behaviour for all post request with bodies
          }),
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
