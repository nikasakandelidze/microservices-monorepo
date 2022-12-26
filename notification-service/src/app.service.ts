import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PatchNotificationWithIds } from './dto/notification.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  async getNotifications(userId: string) {
    if (!userId) {
      throw new BadRequestException({
        message: `User id must be specified to get notifications`,
      });
    }
    const unreadNotifications = await this.notificationModel
      .find({
        $and: [{ 'payload.project.author._id': userId }, { seen: false }],
      })
      .exec();
    return unreadNotifications;
  }

  async notificationSeenPatch(patchNotifications: PatchNotificationWithIds) {
    if (!patchNotifications.notificationIds) {
      throw new BadRequestException({
        message: 'Notification ids must be specified to patch',
      });
    }
    return await this.notificationModel.updateMany(
      {
        _id: {
          $in: patchNotifications.notificationIds.map(
            (notificationId: string) =>
              new mongoose.Types.ObjectId(notificationId),
          ),
        },
      },
      { $set: { seen: true } },
    );
  }
}
