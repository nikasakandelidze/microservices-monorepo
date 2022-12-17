import { Injectable } from '@nestjs/common';
import { User } from './entity';
import { AddUser, PatchUser, PutUser } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { validateAddUser, validatePutUser } from './utils/validator';
import { NotFoundException, ValidationException } from './utils/exceptions';
import { Logger } from '@nestjs/common';
import { Md5 } from 'ts-md5';

@Injectable()
export class UserService {
  private readonly users: Record<string, User> = {};

  public addNewUser(addUser: AddUser): User {
    const { valid, message } = validateAddUser(addUser, this.users);
    if (valid) {
      const newId: string = uuidv4();
      const now = new Date().toISOString();
      const hashedPassword = new Md5().appendAsciiStr(addUser.password).end(false) as string;
      this.users[newId] = {
        id: newId,
        name: addUser.name,
        email: addUser.email,
        passwordHash: hashedPassword,
        createdTimestamp: now,
        updatedTimestamp: now,
      };
      return this.users[newId];
    } else {
      Logger.log(`Validation for add user with email: ${addUser.email} failed. Message: ${message}`);
      throw new ValidationException(message);
    }
  }

  public findUserWithEmail(email: string): User | undefined {
    return Object.keys(this.users)
      .map((id) => this.users[id])
      .find((user) => user.email === email);
  }

  public getUserById(id: string): User {
    const user: User | undefined = this.users[id];
    if (user) {
      return user;
    } else {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  public patchUserWithId(id: string, patch: PatchUser): User {
    const user: User | undefined = this.users[id];
    if (user) {
      const patchObjectWithOnlyDefinedKeys = Object.keys(patch)
        .filter((id) => patch[id])
        .reduce((accumulator, current) => {
          const temp = {};
          temp[current] = patch[current];
          return {
            ...accumulator,
            ...temp,
          };
        }, {});
      this.users[id] = { ...user, ...patchObjectWithOnlyDefinedKeys };
      return this.users[id];
    } else {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  public putUserWithId(id: string, putUser: PutUser): User {
    const user: User | undefined = this.users[id];
    if (user) {
      const validationResult = validatePutUser(putUser);
      if (validationResult.valid) {
        user.email = putUser.email;
        user.name = putUser.name;
        return user;
      } else {
        throw new ValidationException(validationResult.message);
      }
    } else {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }
}
