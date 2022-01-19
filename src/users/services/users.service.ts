import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Not, Repository, UpdateResult } from 'typeorm';

//Models + Entities
//NOTE: It's prefereable to transform DTOs to Entities and work with entities :)
import { UserEntity } from 'src/users/models/user.entity';
import { UserDTO } from '../models/user.dto';

//Services
import { AuthService } from 'src/auth/services/auth.service';

//Exceptions
import { UserNotFoundException } from 'src/users/exceptions';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  createUser(user: UserEntity): Promise<UserEntity> {
    return this.usersRepository.save(user);
  }

  getAllUsers(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  getUser(user: string): Promise<UserEntity> {
    if (this.validateEmail(user)) {
      const email: string = user;
      return this.usersRepository.findOne({ email });
    } else {
      return this.usersRepository.findOne(user);
    }
  }

  async updateUserInfo(
    user: UserEntity,
    password: string,
  ): Promise<UserEntity> {
    const exists = await this.getUser(user.uuid);
    if (!exists) throw new UserNotFoundException(user.uuid);

    const valid = await this.authService.validate(user.uuid, password);
    if (valid) {
      await this.updateUser(user);
      return await this.getUser(user.uuid);
    } else
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
  }
  async updateUserPassword(
    uuid: string,
    old_password: string,
    new_password: string,
  ): Promise<UserEntity> {
    const user = await this.getUser(uuid);
    if (!user) throw new UserNotFoundException(user.uuid);
    const valid = await this.authService.validate(uuid, old_password);
    if (valid) {
      const user = await this.getUser(uuid);
      user.password = new_password;
      await this.updateUser(user);
      return await this.getUser(user.uuid);
    } else
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
  }
  updateUser(user: UserEntity): Promise<UpdateResult> {
    return this.usersRepository.update(user.uuid, user);
  }
  /*
  //INFO: This would save the user if he didn't exist on the repository previously. Not wanted in this case.
  updateUser(user: UserEntity): Promise<UserEntity> {
    return this.usersRepository.save(user);
  }
  */

  deleteUser(user: string | UserEntity): Promise<DeleteResult> {
    if (typeof user === 'object') {
      if (this.validateEmail(user.uuid)) {
        const email: string = user.uuid;
        return this.usersRepository.delete({ email });
      } else {
        return this.usersRepository.delete(user);
      }
    } else {
      if (this.validateEmail(user)) {
        const email: string = user;
        return this.usersRepository.delete({ email });
      } else {
        return this.usersRepository.delete(user);
      }
    }
  }

  emailAlreadyUsed(email: string, uuid?: string): Promise<number> {
    if (uuid) return this.usersRepository.count({ email });
    else
      return this.usersRepository.count({
        uuid: Not(uuid),
        email,
      });
  }

  validateEmail(input: string): boolean {
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
      input,
    );
  }
}
