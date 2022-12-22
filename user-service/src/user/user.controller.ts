import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AddUser, PatchUser } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async registerNewUser(@Body() newUser: AddUser) {
    return await this.userService.addNewUser(newUser);
  }

  @Get()
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Patch(':id')
  async patchUser(@Param('id') id: string, @Body() patchUser: PatchUser) {
    return await this.userService.patchUserWithId(id, patchUser);
  }

  @Get('users/batch')
  async getUsersWithIds(@Req() request: Request) {
    const userIds: string[] = request.query['userIds'] as Array<string>;
    return await this.userService.getUsersByIds(userIds);
  }
}
