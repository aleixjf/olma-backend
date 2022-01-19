//Nest
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DeleteResult, UpdateResult } from 'typeorm';

//Models + Entities
import { UserMapper } from '../models/user.mapper';
import { UserDTO } from '../models/user.dto';
import { UserEntity } from '../models/user.entity';

//Services
import { UsersService } from '../services/users.service';

//Pipes
import { EmailValidationPipe } from '../pipes/email-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private mapper: UserMapper,
  ) {}

  @Post()
  @ApiBearerAuth('access_token')
  @UsePipes(EmailValidationPipe)
  async registerUser(@Body() user: UserDTO): Promise<UserEntity> {
    return this.usersService.createUser(this.mapper.dtoToEntity(user));
  }

  @Post('/email')
  @ApiBearerAuth('access_token')
  async isEmailAlreadyUsed(@Body() email: string): Promise<boolean> {
    const user = await this.usersService.getUser(email);
    return user ? true : false;
  }

  //TODO: Add guard to allow this controller only to be accessible with admin privileges
  @Get()
  @ApiBearerAuth('access_token')
  async getAllUsers(): Promise<UserEntity[]> {
    return this.usersService.getAllUsers();
  }

  //TODO: Add guard to allow this controller only to be accessible with admin privileges
  @Get(':uuid')
  @ApiBearerAuth('access_token')
  async getUser(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ): Promise<UserEntity> {
    return this.usersService.getUser(uuid);
  }

  //TODO: Add guard to allow this controller only to be accessible with admin privileges
  @Put(':uuid')
  @ApiBearerAuth('access_token')
  async updateInfo(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() user: UserDTO,
  ): Promise<UserEntity> {
    const u = user;
    u.uuid = uuid;
    return this.usersService.updateUserInfo(
      this.mapper.dtoToEntity(u),
      user.password,
    );
  }

  //TODO: Add guard to allow this controller only to be accessible with admin privileges
  @Put(':uuid/password')
  @ApiBearerAuth('access_token')
  async updatePassword(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() body: any,
  ): Promise<UserEntity> {
    return this.usersService.updateUserPassword(
      uuid,
      body.old_password,
      body.new_password,
    );
  }
  /*
  TODO: Put vs Patch approach...
  @Patch(':uuid')
  @ApiBearerAuth('access_token')
  patchUser(@Body() user: UserDTO): Promise<UpdateResult> {
    return this.usersService.updateUser(user);
  }
  */

  @Delete(':uuid')
  @ApiBearerAuth('access_token')
  async deleteUser(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ): Promise<DeleteResult> {
    return this.usersService.deleteUser(uuid);
  }
}
