import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID:
        '762843962135-egvhvo3jd8qu0g4nu2u17588avtlmcko.apps.googleusercontent.com', // <- Replace this with your client id
      clientSecret: 'C0CV46TvqpF1oiEF2NVFBikH', // <- Replace this with your client secret
      callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
      passReqToCallback: true,
      scope: ['profile'],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile,
    done, //Function
  ) {
    try {
      console.log(profile);

      const jwt = 'test';
      /*
      const jwt: string = await this.authService.validateOAuthLogin(
        profile.id,
      );
      */
      const user = {
        jwt,
      };

      done(null, user);
    } catch (err) {
      //console.log(err)
      done(err, false);
    }
  }
}
