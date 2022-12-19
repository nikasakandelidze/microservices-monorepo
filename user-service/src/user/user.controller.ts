import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AddUser, PatchUser } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  registerNewUser(@Body() newUser: AddUser) {
    return this.userService.addNewUser(newUser);
  }

  @Get(':id')
  loginUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  verifyToken(@Param('id') id: string, @Body() patchUser: PatchUser) {
    return this.userService.patchUserWithId(id, patchUser);
  }
}
