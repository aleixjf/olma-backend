//Nest
import { Controller, Get, Request, Body, UseGuards, Put } from '@nestjs/common';

//Models + Entities
import { UserMapper } from 'src/users/models/user.mapper';
import { UserEntity } from 'src/users/models/user.entity';
import { UserDTO } from 'src/users/models/user.dto';

//Services
import { UsersService } from 'src/users/services/users.service';

//Guards
import { JwtGuard } from 'src/shared/guards/jwt.guard';

@Controller('auth/profile')
export class ProfileController {
  constructor(private usersService: UsersService, private mapper: UserMapper) {}

  @UseGuards(JwtGuard)
  @Get()
  async getProfile(@Request() req): Promise<UserEntity> {
    console.log(req.user.uuid);
    return this.usersService.getUser(req.user.uuid);
  }

  @UseGuards(JwtGuard)
  @Put()
  async updateInfo(@Request() req, @Body() user: UserDTO): Promise<UserEntity> {
    const uuid = req.user.uuid;
    const u = user;
    u.uuid = uuid;
    return this.usersService.updateUserInfo(
      this.mapper.dtoToEntity(u),
      user.password,
    );
  }

  @UseGuards(JwtGuard)
  @Put('password')
  async updatePassword(
    @Request() req,
    @Body() body: { old_password: string; new_password: string },
  ): Promise<UserEntity> {
    const uuid = req.user.uuid;
    return this.usersService.updateUserPassword(
      uuid,
      body.old_password,
      body.new_password,
    );
  }
}
