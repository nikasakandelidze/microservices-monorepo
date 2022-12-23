import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Mixed, Types } from 'mongoose';

export type OutboxMessageDocument = HydratedDocument<OutboxMessage>;

@Schema({ timestamps: true })
export class OutboxMessage {
  _id: Types.ObjectId;
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  header: Mixed;
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  payload: Mixed;
  @Prop({ required: true })
  type: string;
  @Prop({ default: false })
  processed: boolean;
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
}

export const OutboxMessageSchema = SchemaFactory.createForClass(OutboxMessage);
