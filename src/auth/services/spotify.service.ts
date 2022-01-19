//Nest
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

//RxJS
import { catchError, lastValueFrom, map, throwError } from 'rxjs';

//Models + Entities
import { RefreshTokenEntity } from '../models/refresh-token.entity';
import { AuthorizationResponse } from '../models/authorization.interface';

//Services
import { TokenService } from 'src/auth/services/token.service';
import { AccessTokenEntity } from '../models/access-token.entity';

@Injectable()
export class SpotifyService {
  private backendAPI: string;
  private clientID: string | undefined;
  private clientSecret: string | undefined;

  constructor(
    private http: HttpService,
    private tokenService: TokenService,
    private configService: ConfigService,
  ) {
    this.backendAPI = 'https://accounts.spotify.com/api/token';
    this.clientID = this.configService.get<string>('spotify.client');
    this.clientSecret = this.configService.get<string>('spotify.secret');
  }

  async get_refreshed_token(
    uuid: string,
  ): Promise<AccessTokenEntity | undefined> {
    const refresh_token: RefreshTokenEntity = await this.tokenService.findToken(
      uuid,
      'refresh_token',
      'spotify',
    );

    const resp = await lastValueFrom(
      this.refresh_token(refresh_token.jwt, uuid),
    );

    //INFO: We only store the refresh token, we don't return it
    if (resp.refresh_token)
      await this.tokenService.createToken(
        uuid,
        resp.refresh_token,
        'refresh_token',
        undefined,
        undefined,
        undefined,
        'spotify',
      );

    let access_token: AccessTokenEntity | undefined;
    if (resp.access_token) {
      access_token = await this.tokenService.createToken(
        uuid,
        resp.access_token,
        'access_token',
        undefined,
        resp.expires_in,
        undefined,
        'spotify',
      );
    }

    return access_token;
  }

  refresh_token(refresh_token: string, uuid: string) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        new Buffer(
          this.configService.get<string>('spotify.client') +
            ':' +
            this.configService.get<string>('spotify.secret'),
        ).toString('base64'),
      /*
      Authorization:
        'Basic ' +
        Buffer.from(
          `${this.configService.get<string>(
            'spotify.client',
          )}:${this.configService.get<string>('spotify.secret')}`,
          'base64',
        ),
      */
    };
    const params = {
      grant_type: 'refresh_token',
      refresh_token,
      //client_id: this.configService.get<string>('spotify.client'),
    };

    return this.http
      .post<AuthorizationResponse>(this.backendAPI, undefined, {
        headers,
        params,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          //console.log(error.response); //INFO: This is the whole error (previous map doesn't affect)
          const description = error.response.data.error_description;
          console.log(
            `Status: ${error.response.status}\nError: ${error.response.data.error}\nDescription: ${description}`,
          );
          //INFO: The token has already been used...
          if (description === 'Invalid refresh token')
            this.tokenService.deleteToken(uuid, 'refresh_token', 'spotify');
          return throwError(error);
        }),
      );
  }

  delete_refresh_token(uuid: string) {
    return this.tokenService.deleteToken(uuid, 'refresh_token', 'spotify');
  }
}
