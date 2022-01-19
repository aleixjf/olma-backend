import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.usersService.getUser(username);
    if (user) {
      const valid = await this.authService.validate(user, password);
      if (valid) return this.authService.get_tokens(user);
      else throw new UnauthorizedException('Invalid password');
    } else {
      throw new UnauthorizedException("Email doesn't exist");
    }

    /*
    const valid = await this.authService.validate(username, password);
    if (!valid) {
      throw new UnauthorizedException();
    } else {
      return true;
    }
    */
  }
}
