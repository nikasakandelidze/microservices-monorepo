import { Controller, Get, Post, Patch, Put, Body, Param } from '@nestjs/common';
import { AddUser, PatchUser, PutUser } from './dto';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  addUser(@Body() addUser: AddUser) {
    return this.userService.addNewUser(addUser);
  }

  @Get()
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  getUserWithId(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  patchlUserWithId(@Param('id') id: string, @Body() patch: PatchUser) {
    return this.userService.patchUserWithId(id, patch);
  }

  @Put(':id')
  updateUserWithId(@Param('id') id: string, @Body() putUser: PutUser) {
    return this.userService.putUserWithId(id, putUser);
  }
}
