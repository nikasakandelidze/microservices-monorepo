import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './schema/comment.schema';
import { TicketSchema } from './schema/ticket.schema';
import { SprintSchema } from './schema/sprint.schema';

const MONGO_DB_URL = 'mongodb://ticket:ticketpassword@localhost:27027';

const SCHEMA_DEFINITIONS = [
  { name: 'Comment', schema: CommentSchema },
  { name: 'Ticket', schema: TicketSchema },
  { name: 'Sprint', schema: SprintSchema },
];

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_DB_URL),
    MongooseModule.forFeature(SCHEMA_DEFINITIONS),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
