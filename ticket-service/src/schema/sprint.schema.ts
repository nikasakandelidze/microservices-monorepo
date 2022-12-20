import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Ticket } from './ticket.schema';

// Note
// What this will do is when inserting new spring with tickets array only ticket._id -s will be stored in the array
// and when fetching data of the spring you can use populate('tickets') to get full information about tickets

export type SprintDocument = HydratedDocument<Sprint>;

@Schema({ timestamps: true })
export class Sprint {
  _id: Types.ObjectId;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  description: string;
  authorId: Types.ObjectId;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }] })
  tickets: Ticket[];
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
}

export const SprintSchema = SchemaFactory.createForClass(Sprint);
