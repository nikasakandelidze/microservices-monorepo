import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './schema/comment.schema';
import { TicketSchema } from './schema/ticket.schema';
import { SprintSchema } from './schema/sprint.schema';
import { TicketService } from './provider/ticket.provider';
import { SprintService } from './provider/sprint.provider';
import { CommentService } from './provider/comment.provider';
import { ServiceDiscovery } from './provider/service.discovery.provider';
import { HttpModule } from '@nestjs/axios';
import { ProjectSchema } from './schema/project.schema';
import { ProjectService } from './provider/project.provider';
import { BullModule } from '@nestjs/bull';
import { OutboxMessageSchema } from './schema/outbox.message.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxRelayService } from './provider/outbox.relay.provider';

const MONGO_DB_URL = 'mongodb://ticket:ticketpassword@localhost:27027';
const MESSAGE_QUEUE_HOST = 'localhost';
const MESSAGE_QUEUE_PORT = 6380;

const SCHEMA_DEFINITIONS = [
  { name: 'Comment', schema: CommentSchema },
  { name: 'Ticket', schema: TicketSchema },
  { name: 'Sprint', schema: SprintSchema },
  { name: 'Project', schema: ProjectSchema },
  { name: 'OutboxMessage', schema: OutboxMessageSchema },
];

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_DB_URL),
    MongooseModule.forFeature(SCHEMA_DEFINITIONS),
    HttpModule,
    BullModule.forRoot({
      redis: {
        host: MESSAGE_QUEUE_HOST,
        port: MESSAGE_QUEUE_PORT,
      },
    }),
    BullModule.registerQueue({ name: 'notification-queue' }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    TicketService,
    SprintService,
    CommentService,
    ProjectService,
    ServiceDiscovery,
    OutboxRelayService,
  ],
})
export class AppModule {}
