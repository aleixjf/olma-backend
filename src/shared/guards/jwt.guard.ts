import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info: Error) {
    if (err) {
      /*
      console.log('Error:')
      console.log(err)
      */
      throw err;
    } else if (info) {
      /*
      console.log('Info')
      console.log(info)
      throw info;
      */
      //throw new HttpException(info.message, 401)
      throw new UnauthorizedException(info.message);
    } else if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
