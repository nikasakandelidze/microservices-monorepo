import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageConsumerService } from './provider/message.consumer.provider';

const MESSAGE_QUEUE_HOST = 'localhost';
const MESSAGE_QUEUE_PORT = 6380;
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: MESSAGE_QUEUE_HOST,
        port: MESSAGE_QUEUE_PORT,
      },
    }),
    BullModule.registerQueue({ name: 'notification-queue' }),
  ],
  controllers: [AppController],
  providers: [AppService, MessageConsumerService],
})
export class AppModule {}
