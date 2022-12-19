import { Body, Controller, Post } from '@nestjs/common';
import { AddUser } from 'src/user/dto/user.dto';
import { AuthService } from './auth.service';
import { LoginUser, VerifyToken } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerNewUser(@Body() newUser: AddUser) {
    return this.authService.registerUser(newUser);
  }

  @Post('login')
  loginUser(@Body() loginUser: LoginUser) {
    return this.authService.loginUser(loginUser);
  }

  @Post('verify')
  verifyToken(@Body() verifyToken: VerifyToken) {
    return this.authService.verifyToken(verifyToken);
  }
}
