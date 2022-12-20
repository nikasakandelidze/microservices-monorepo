import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
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
  authorId: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' })
  sprint: Sprint;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
