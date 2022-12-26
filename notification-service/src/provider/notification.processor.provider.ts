import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationMessageDto } from 'src/dto/message.dto';
import { NotificationDocument } from 'src/schema/notification.schema';

@Injectable()
export class NotificationProcessor {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async processNotification(notification: NotificationMessageDto) {
    const type = notification.type;
    const id = notification._id;
    const entity = await this.notificationModel.findById(id).exec();
    if (!entity) {
      if (type === 'PROJECT_ADDED') {
        const result = await new this.notificationModel({
          ...notification,
        }).save();
        Logger.log(
          `Added new notification about PROJECT_ADDED in database: ${result}`,
        );
        Logger.log(`Processing PROJECT_ADDED notification: ${notification}`);
      }
    } else {
      Logger.log(`Skipping already processed notification: ${notification}`);
    }
  }
}
