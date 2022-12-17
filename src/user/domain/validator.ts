import { User } from './domain';
import { AddUser, PutUser } from '../web/dto';

export type ValidationResult = {
  message: string;
  valid: boolean;
};

export const validateAddUser = (addUser: AddUser, users: Record<string, User>): ValidationResult => {
  const validationResult: ValidationResult = {
    message: undefined,
    valid: true,
  };
  const sameEmailUser: string | undefined = Object.keys(users).find((id) => users[id].email === addUser.email);
  if (sameEmailUser) {
    validationResult.message = `User with email: ${addUser.email} is already present`;
    validationResult.valid = false;
  } else if (!addUser.name) {
    validationResult.message = `User name must not be empty`;
    validationResult.valid = false;
  } else if (!addUser.email) {
    validationResult.message = `User email must not be empty`;
    validationResult.valid = false;
  }
  return validationResult;
};

export const validatePutUser = (putUser: PutUser) => {
  const result: ValidationResult = { message: undefined, valid: true };
  if (!putUser.email) {
    result.message = 'Email must be specified';
    result.valid = false;
  } else if (!putUser.name) {
    result.message = 'Name must be specified';
    result.valid = false;
  }
  return result;
};
