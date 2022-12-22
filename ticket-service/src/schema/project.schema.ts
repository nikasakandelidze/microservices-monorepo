import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Sprint } from './sprint.schema';
import { User } from './user.schema';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  _id: Types.ObjectId;
  @Prop({ unique: true })
  title: string;
  @Prop()
  description: string;
  @Prop()
  author: User; //differently from tickets,sprints,comments where we simply have references. This mechanism will be much more read friendly
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' }] })
  sprints: Sprint[];
  @Prop()
  createdAt?: Date;
  @Prop()
  updatedAt?: Date;
  @Prop()
  members: Array<User>;
}

// what exactly does this do?
export const ProjectSchema = SchemaFactory.createForClass(Project);
