export class AddUser {
  name: string;
  email: string;
  password: string;
}

export class GetUser {
  id: string;
  name: string;
  email: string;
}

export class PatchUser {
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
}

export class PutUser {
  name: string;
  email: string;
}
