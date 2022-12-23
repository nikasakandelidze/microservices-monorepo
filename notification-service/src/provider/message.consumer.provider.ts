import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationMessageDto } from 'src/dto/message.dto';

@Processor('notification-queue')
export class MessageConsumerService {
  @Process()
  async consumeNotificationMessage(job: Job) {
    const data = job.data as NotificationMessageDto;
    console.log(`received job: ${data}`);
  }
}
