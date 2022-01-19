//Nest
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

//Models + Entities
import { CredentialsDTO } from '../models/credentials.dto';
import { UserEntity } from 'src/users/models/user.entity';

//Services
import { AuthService } from 'src/auth/services/auth.service';
import { UsersService } from 'src/users/services/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post()
  async login(@Body() credentials: CredentialsDTO): Promise<UserEntity> {
    const user = await this.usersService.getUser(credentials.email);
    console.log(credentials.password);
    if (user) {
      const valid = await this.authService.validate(user, credentials.password);
      if (valid) return this.authService.get_tokens(user);
      else throw new UnauthorizedException('Invalid password');
    } else {
      throw new UnauthorizedException("Email doesn't exist");
    }
  }
}
