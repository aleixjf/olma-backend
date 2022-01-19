//Nest
import { forwardRef, Inject, Injectable } from '@nestjs/common';

//Entities
import { UserEntity } from 'src/users/models/user.entity';
import { AccessTokenEntity } from '../models/access-token.entity';
import { RefreshTokenEntity } from '../models/refresh-token.entity';

//Services
import { UsersService } from 'src/users/services/users.service';
import { TokenService } from 'src/auth/services/token.service';
import { DropboxService } from 'src/auth/services/dropbox.service';
import { OneDriveService } from 'src/auth/services/onedrive.service';
import { SpotifyService } from 'src/auth/services/spotify.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private tokenService: TokenService,
    private dropboxService: DropboxService,
    private oneDriveService: OneDriveService,
    private spotifyService: SpotifyService,
  ) {}

  async validate(
    user: UserEntity | string,
    password: string,
  ): Promise<boolean> {
    if (typeof user === 'string') user = await this.usersService.getUser(user);
    return user.validatePassword(password);
  }

  async get_tokens(user: UserEntity | string): Promise<any> {
    const uuid = user instanceof UserEntity ? user.uuid : user;

    /* Access Token */
    const access_token_jwt = await this.tokenService.signToken(
      uuid,
      'access_token',
    );
    const access_token = await this.tokenService.createToken(
      uuid,
      access_token_jwt,
      'access_token',
    );

    /* Refresh Token */
    const refresh_token_jwt = await this.tokenService.signToken(
      uuid,
      'refresh_token',
    );
    const refresh_token = await this.tokenService.createToken(
      uuid,
      refresh_token_jwt,
      'refresh_token',
    );

    return {
      user: uuid,
      tokens: {
        //type: 'bearer',
        /*
        access_token,
        ...(refresh_token ? { refresh_token } : {}),
        */
        olma: access_token,
        olma_refresh: refresh_token,
      },
    };
  }

  async get_third_party_tokens(user: UserEntity | string): Promise<any> {
    const uuid = user instanceof UserEntity ? user.uuid : user;

    const response = {
      spotify: undefined,
      dropbox: undefined,
      onedrive: undefined,
    };

    /*  Connected services Tokens */
    let spotify: AccessTokenEntity;
    const spotify_refresh: RefreshTokenEntity =
      await this.tokenService.findToken(uuid, 'refresh_token', 'spotify');
    if (spotify_refresh) {
      spotify = await this.spotifyService.get_refreshed_token(uuid);
      response.spotify = spotify;
    }

    let dropbox: AccessTokenEntity;
    const dropbox_refresh: RefreshTokenEntity =
      await this.tokenService.findToken(uuid, 'refresh_token', 'dropbox');
    if (dropbox_refresh) {
      dropbox = await this.dropboxService.get_refreshed_token(uuid);
      response.dropbox = dropbox;
    }

    let onedrive: AccessTokenEntity;
    const onedrive_refresh: RefreshTokenEntity =
      await this.tokenService.findToken(uuid, 'refresh_token', 'onedrive');
    if (onedrive_refresh) {
      onedrive = await this.oneDriveService.get_refreshed_token(uuid);
      response.onedrive = onedrive;
    }

    return response;
  }
}
