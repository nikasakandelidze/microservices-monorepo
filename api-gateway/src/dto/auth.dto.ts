export class TokenVerificationResult {
  verified: boolean;
  id: string;
  email: string;
  iss: string;
  sub: string;
  iat: number;
  exp: number;
}
