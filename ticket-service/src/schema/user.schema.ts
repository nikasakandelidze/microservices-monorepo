import { Schema, Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// This is a nested schema
@Schema()
export class User {
  _id: Types.ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: false })
  email: string;
}

// Notice that we don't create collection for this schema. It's used here as simply embedded schema in other collection documents
