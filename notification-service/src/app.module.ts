import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageConsumerService } from './provider/message.consumer.provider';
import { NotificationProcessor } from './provider/notification.processor.provider';
import { ServiceDiscovery } from './provider/service.discovery.provider';
import { NotificationSchema } from './schema/notification.schema';

const MESSAGE_QUEUE_HOST = 'localhost';
const MESSAGE_QUEUE_PORT = 6380;
const MONGO_DB_URL =
  'mongodb://notification:notificationpassword@localhost:27028';

const SCHEMA_DEFINITIONS = [
  { name: 'Notification', schema: NotificationSchema },
];

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: MESSAGE_QUEUE_HOST,
        port: MESSAGE_QUEUE_PORT,
      },
    }),
    BullModule.registerQueue({ name: 'notification-queue' }),
    MongooseModule.forRoot(MONGO_DB_URL),
    MongooseModule.forFeature(SCHEMA_DEFINITIONS),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MessageConsumerService,
    NotificationProcessor,
    ServiceDiscovery,
  ],
})
export class AppModule {}
