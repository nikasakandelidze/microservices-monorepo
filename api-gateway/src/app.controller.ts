import { All, Controller, Req, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller('api/*')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @All()
  async forward(@Req() req: Request) {
    const url = `${req.protocol}://${req.get('Host')}${req.originalUrl}`;
    const method = req.method;
    Logger.log(`Got Http: ${method} request on URL: ${url}`);
    return await this.appService.handleApiGatewayRequest(req);
  }
}
