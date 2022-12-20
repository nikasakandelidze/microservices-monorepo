import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Ticket } from './ticket.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  _id: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
  @Prop()
  auhtorId: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' })
  ticket: Ticket;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
