import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get(':userId/posts')
  findUserPosts(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.findUserPosts(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Put('nickname')
  @UseGuards(AuthGuard('jwt'))
  updateNickname(@Body() updateNicknameDto: UpdateNicknameDto, @Req() req) {
    return this.usersService.updateNickname(req.user.id, updateNicknameDto);
  }

  @Put('password')
  @UseGuards(AuthGuard('jwt'))
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto, @Req() req) {
    return this.usersService.updatePassword(req.user.id, updatePasswordDto);
  }
}
