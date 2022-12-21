import { Injectable } from '@nestjs/common';
import { NotFoundException, ValidationException } from './exception';
import { Logger } from '@nestjs/common';
import { Md5 } from 'ts-md5';
import { validateAddUser } from './validator';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddUser, PatchUser } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<UserDocument>) {}

  public async addNewUser(addUser: AddUser): Promise<User> {
    Logger.log(addUser);
    const validationResult = validateAddUser(addUser);
    if (!validationResult.valid) {
      throw new ValidationException(validationResult.message);
    }
    const userWithSameEmail = await this.userModel.findOne({ email: addUser.email }).exec();
    if (userWithSameEmail) {
      const message = `User with email: ${addUser.email} already exists`;
      Logger.log(`Validation for add user with email: ${addUser.email} failed. Message: ${message}`);
      throw new ValidationException(message);
    }
    const now = new Date().toISOString();
    const hashedPassword = new Md5().appendAsciiStr(addUser.password).end(false) as string;
    const newUser = {
      name: addUser.name,
      email: addUser.email,
      passwordHash: hashedPassword,
      createdTimestamp: now,
      updatedTimestamp: now,
    } as User;
    const user = new this.userModel(newUser);
    return await user.save();
  }

  public async getAllUsers() {
    return this.userModel.find({}, '_id name email createdTimeStamp updatedTimeStamp');
  }

  public async findUserWithEmail(email: string): Promise<User> {
    const userWithSameEmail = await this.userModel.findOne({ email }).exec();
    return userWithSameEmail;
  }

  public async getUserById(id: string): Promise<User> {
    const userWithId: User = await this.userModel.findById(id, '_id name email createdTimeStamp updatedTimeStamp').exec();
    if (userWithId) {
      return userWithId;
    } else {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  public async patchUserWithId(id: string, patch: PatchUser): Promise<User> {
    if (!patch.email && !patch.name) {
      throw new ValidationException('Nothign to patch');
    }
    const emailPatch = patch.email ? { email: patch.email } : {};
    const namePatch = patch.name ? { name: patch.name } : {};
    const mutation = { ...emailPatch, ...namePatch };
    await this.userModel.updateOne({ _id: id }, { $set: { ...mutation } }).exec();
    return await this.userModel.findById(id).exec();
  }
}
