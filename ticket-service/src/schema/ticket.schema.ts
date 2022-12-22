import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { TicketStatus } from 'src/common/common.types';
import { Comment } from './comment.schema';
import { Sprint } from './sprint.schema';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
  _id: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
  @Prop()
  authorId: Types.ObjectId;
  @Prop()
  assigneeId: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' })
  sprint: Sprint;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];
  @Prop({ default: 'BACKLOG' })
  status: TicketStatus;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
