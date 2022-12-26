import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationMessageDto } from 'src/dto/message.dto';
import { NotificationProcessor } from './notification.processor.provider';
import { Logger } from '@nestjs/common';

@Processor('notification-queue')
export class MessageConsumerService {
  constructor(private readonly notificationProcessor: NotificationProcessor) {}
  @Process()
  async consumeNotificationMessage(job: Job) {
    const data = job.data as NotificationMessageDto;
    Logger.log(`Received queue job with data: ${data}`);
    return await this.notificationProcessor.processNotification(data);
  }
}
