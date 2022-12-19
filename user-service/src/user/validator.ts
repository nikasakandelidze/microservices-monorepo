import { AddUser, PutUser } from './dto/user.dto';

export type ValidationResult = {
  message: string;
  valid: boolean;
};

export const validateAddUser = (addUser: AddUser): ValidationResult => {
  const validationResult: ValidationResult = {
    message: undefined,
    valid: true,
  };
  if (!addUser.name) {
    validationResult.message = `User name must not be empty`;
    validationResult.valid = false;
  } else if (!addUser.email) {
    validationResult.message = `User email must not be empty`;
    validationResult.valid = false;
  } else if (!addUser.password) {
    validationResult.message = `User password must not be empty`;
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
