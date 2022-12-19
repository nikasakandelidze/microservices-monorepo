import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

// what exactly does this do?
export type UserDocument = HydratedDocument<User>;

@Schema() // schema maps this class to the collection with the same name but in the plural(with "s" appended in the end).
export class User {
  _id: Types.ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  createdTimestamp: string;
  @Prop({ required: true })
  updatedTimestamp: string;
  @Prop({ required: true })
  passwordHash: string;
}

// what exactly does this do?
export const UserSchema = SchemaFactory.createForClass(User);
