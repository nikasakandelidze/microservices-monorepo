export class UserDto {
  _id: string;
  name: string;
  email: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  passwordHash?: string;
}
