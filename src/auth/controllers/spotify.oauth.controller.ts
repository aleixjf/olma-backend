//Nest
import {
  Controller,
  Get,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  Post,
  Body,
  Request,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

//RxJS
import {
  catchError,
  firstValueFrom,
  lastValueFrom,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';

//Models + Entities
import { AccessTokenEntity } from '../models/access-token.entity';

//Services
import { SpotifyService } from 'src/auth/services/spotify.service';

//Guards
import { JwtGuard } from 'src/shared/guards/jwt.guard';

//Other dependencies
import { URLSearchParams } from 'url';

@Controller('oauth/spotify')
export class SpotifyOAuthController {
  constructor(
    private configService: ConfigService,
    private spotifyService: SpotifyService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('spotify'))
  spotifyLogin() {
    // Automatically initiates the Spotify OAuth2 login flow thanks to the AuthGuard.
    // Code inside this function is never reached / executed.
  }

  @Get('callback')
  @UseGuards(AuthGuard('spotify'))
  async spotifyLoginCallback(@Req() req, @Res() res) {
    // Handles the spotify OAuth2 callback
    //console.dir(req);
    //console.dir(res);

    // INFO: req.user contains the data returned by the validate method
    let params: URLSearchParams;
    if (req.user) {
      // TODO: Add Spotify refresh_token to user tokens in DB or the access_token in the NgRX Store?
      params = new URLSearchParams({
        platform: 'spotify',
        access_token: req.user.access_token,
      });
    } else {
      params = new URLSearchParams({
        platform: 'spotify',
        error: 'unknown',
      });
    }
    res.redirect(
      this.configService.get('app.url') + '/auth?' + params.toString(),
    );

    if (!req.user) {
      throw new UnauthorizedException();
    } else {
      /*
      res.send({
        tokens: {
          spotify: req.user.access_token,
          spotify_refresh: req.user.refresh_token,
        },
      });
      */
      /*
      res.cookie('spotify_token', req.user.access_token, {
        expires: new Date(new Date().getTime() + 30 * 1000),
        sameSite: 'strict',
        httpOnly: true,
      });
      res.redirect(this.configService.get('app.url') + '/auth?platform=spotify');
      */
    }
  }

  /*
  @Post('callback')
  async spotifyAccessToken(@Body() body: any, @Res() res) {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: body.code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(client_id + ':' + client_secret).toString('base64'),
      },
      json: true,
    };
    res.redirect();
  }
  */

  @UseGuards(JwtGuard)
  @Get('refresh')
  async refreshToken(@Request() req): Promise<AccessTokenEntity> {
    return this.spotifyService.get_refreshed_token(req.user.uuid);
  }

  @UseGuards(JwtGuard)
  @Delete()
  async deleteRefreshToken(@Request() req) {
    return this.spotifyService.delete_refresh_token(req.user.uuid);
  }
}
