import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-spotify';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TokenService } from 'src/auth/services/token.service';

//const callbackURL = `${this.configService.get<string>('app.api'}/auth/spotify/callback`;
const scopes = [
  /* Listening History */
  // 'user-read-recently-played',
  // 'user-top-read',
  // 'user-read-playback-position',
  /* Spotify Connect */
  // 'user-read-playback-state',
  // 'user-modify-playback-state',
  // 'user-read-currently-playing',
  /* Playback */
  // 'streaming',
  /* Playlists */
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  /* Library */
  'user-library-modify',
  'user-library-read',
  /* Users */
  // 'user-read-email',
  // 'user-read-private',
];
const scope = scopes.join(' ');
/*
const params = new URLSearchParams({
  client_id: process.env.spotify.client,
  redirect_uri: `${process.env.BACKEND_URL}/auth/spotify/callback`,
  scope,
  response_type: 'code',
});
*/

@Injectable()
export class SpotifyStrategy extends PassportStrategy(Strategy, 'spotify') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL:
        'https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
          client_id: configService.get<string>('spotify.client'),
          redirect_uri: `${configService.get<string>(
            'app.api',
          )}/auth/spotify/callback`,
          scope,
          response_type: 'code',
        }).toString(),
      tokenURL: 'https://accounts.spotify.com/api/token',
      clientID: configService.get<string>('spotify.client'),
      clientSecret: configService.get<string>('spotify.secret'),
      callbackURL: `${configService.get<string>(
        'app.api',
      )}/auth/spotify/callback`,
      scope,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile, //Spotify profile information
    verified, //Spotify function
    //expires_in,
  ) {
    // INFO: What we return here is what will be available later in req.user!!!

    //console.log(`Acces Token: ${accessToken}`);
    //console.log(`Refresh Token: ${refreshToken}`);
    //console.dir(profile);
    //console.log(`Verified function: ${verified}`);
    //console.log(`Expires in: ${expires_in}`);

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
