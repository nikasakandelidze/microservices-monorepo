import { Injectable } from '@nestjs/common';
import { User } from './domain/domain';
import { AddUser, GetUser, PatchUser, PutUser } from './web/dto';
import { v4 as uuidv4 } from 'uuid';
import { validateAddUser, validatePutUser } from './domain/validator';
import { NotFoundException, ValidationException } from './utils/exceptions';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly users: Record<string, User> = {};

  public addNewUser(addUser: AddUser): User {
    const { valid, message } = validateAddUser(addUser, this.users);
    if (valid) {
      const newId: string = uuidv4();
      this.users[newId] = {
        id: newId,
        name: addUser.name,
        email: addUser.email,
        password: addUser.password,
      };
      return this.users[newId];
    } else {
      Logger.log(`Validation for add user with email: ${addUser.email} failed. Message: ${message}`);
      throw new ValidationException(message);
    }
  }

  public getAllUsers(): Array<GetUser> {
    return Object.keys(this.users)
      .map((id) => this.users[id])
      .map((user) => ({ id: user.id, name: user.name, email: user.email }));
  }

  public getUserById(id: string): GetUser {
    const user: User | undefined = this.users[id];
    if (user) {
      return { id: user.id, name: user.name, email: user.email };
    } else {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  public patchUserWithId(id: string, patch: PatchUser): GetUser {
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
      return { id: user.id, name: user.name, email: user.email };
    } else {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }

  public putUserWithId(id: string, putUser: PutUser): GetUser {
    const user: User | undefined = this.users[id];
    if (user) {
      const validationResult = validatePutUser(putUser);
      if (validationResult.valid) {
        user.email = putUser.email;
        user.name = putUser.name;
        return { id: user.id, name: user.name, email: user.email };
      } else {
        throw new ValidationException(validationResult.message);
      }
    } else {
      throw new NotFoundException(`User with id: ${id} not found`);
    }
  }
}
