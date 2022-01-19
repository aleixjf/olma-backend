import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { HttpService } from '@nestjs/axios';
import { TokenService } from '../services/token.service';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy, 'spotify') {
  constructor(private http: HttpService, private tokenService: TokenService) {
    super({
      /*
      authorizationURL,
      tokenURL,
      clientID,
      clientSecret,
      callbackURL,
      scope,
      */
    });
  }

  async validate(accessToken: string, refreshToken: string, profile, cb) {
    // INFO: What we return here is what will be available later in req.user!!!

    //console.log(`Acces Token: ${accessToken}`);
    //console.log(`Refresh Token: ${refreshToken}`);

    /*
    try {
      const jwt: string = await this.authService.validateOAuthLogin(
        profile.id,
      );
      cb(null, { jwt });
    } catch (err) {
      //console.log(err)
      cb(err, false);
    }
    */

    /*
    try {
      const token = await this.tokenService.registerRefreshToken(
        'TODO',
        3600,
        refreshToken,
        'spotify',
      );
      cb(null, { jwt: token.refresh_token });
    } catch (err) {
      //console.log(err)
      cb(err, false);
    }
    */

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
