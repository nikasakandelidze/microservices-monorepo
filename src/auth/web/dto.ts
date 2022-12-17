export class AuthResponse {
  token: string;
}

export class LoginUser {
  email: string;
  password: string;
}

export class VerifyToken {
  token: string;
}

export class TokenVerificationResult {
  verified: boolean;
  id: string;
  email: string;
  iss: string;
  sub: string;
  iat: number;
  exp: number;
}
