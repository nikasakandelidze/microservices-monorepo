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

const MONGO_DB_URL = 'mongodb://ticket:ticketpassword@localhost:27027';

const SCHEMA_DEFINITIONS = [
  { name: 'Comment', schema: CommentSchema },
  { name: 'Ticket', schema: TicketSchema },
  { name: 'Sprint', schema: SprintSchema },
  { name: 'Project', schema: ProjectSchema },
];

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_DB_URL),
    MongooseModule.forFeature(SCHEMA_DEFINITIONS),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    TicketService,
    SprintService,
    CommentService,
    ProjectService,
    ServiceDiscovery,
  ],
})
export class AppModule {}
