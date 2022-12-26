import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PatchNotificationWithIds } from './dto/notification.dto';

@Controller('/api/notification')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getNotification(@Query('userId') userId: string) {
    return await this.appService.getNotifications(userId);
  }

  @Patch('seen')
  async notificationSeenPatch(
    @Body() patchNotifications: PatchNotificationWithIds,
  ) {
    return await this.appService.notificationSeenPatch(patchNotifications);
  }
}
