import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { UserController } from './user.controller';

const AUTHENTICATION_SERVICE_DB_URL = 'mongodb://auth:authpassword@localhost';
@Module({
  imports: [MongooseModule.forRoot(AUTHENTICATION_SERVICE_DB_URL), MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
