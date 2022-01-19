import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UserDTO } from '../models/user.dto';
import { UsersService } from '../services/users.service';

@Injectable()
export class EmailValidationPipe implements PipeTransform {
  constructor(private usersService: UsersService) {}

  async transform(user: UserDTO | string) {
    const numUsers: number =
      typeof user === 'string'
        ? await this.usersService.emailAlreadyUsed(user)
        : await this.usersService.emailAlreadyUsed(user.email, user.uuid);

    if (numUsers > 0) {
      throw new BadRequestException('Email value already exists');
    } else {
      return user;
    }
  }
}
