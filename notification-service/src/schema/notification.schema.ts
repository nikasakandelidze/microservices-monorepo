import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Mixed, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  _id: Types.ObjectId;
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  header: Mixed;
  @Prop({ required: true, type: mongoose.Schema.Types.Mixed })
  payload: Mixed;
  @Prop({ required: true })
  type: string;
  @Prop({ default: false })
  seen: boolean;
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
