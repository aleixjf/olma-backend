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
export class OneDriveService {
  private backendAPI: string;
  private clientID: string | undefined;
  private clientSecret: string | undefined;
  private tenant: 'common' | 'organization' | 'consumers';

  constructor(
    private http: HttpService,
    private tokenService: TokenService,
    private configService: ConfigService,
  ) {
    this.tenant = 'common';
    this.backendAPI = `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`;
    this.clientID = this.configService.get<string>('microsoft.client');
    this.clientSecret = this.configService.get<string>('microsoft.secret');
  }

  async get_refreshed_token(
    uuid: string,
  ): Promise<AccessTokenEntity | undefined> {
    const refresh_token: RefreshTokenEntity = await this.tokenService.findToken(
      uuid,
      'refresh_token',
      'onedrive',
    );
    const resp = await lastValueFrom(this.refresh_token(refresh_token.jwt));

    //INFO: We only store the refresh token, we don't return it
    if (resp.refresh_token)
      await this.tokenService.createToken(
        uuid,
        resp.refresh_token,
        'refresh_token',
        undefined,
        undefined,
        undefined,
        'onedrive',
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
        'onedrive',
      );
    }

    return access_token;
  }

  refresh_token(refresh_token: string) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: this.configService.get<string>('app.api'),
    };
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      redirect_uri: `${this.configService.get<string>(
        'app.api',
      )}/auth/onedrive/callback`,
      client_id: this.configService.get<string>('microsoft.client'),
      //client_secret: this.configService.get<string>('microsoft.client'),
      /*
      INFO: OneDrive differentiates the Public/Private clients inside the JWT & with the help of the URI too.
      It detects that this refresh token was generated for a public SPA, hence we can't add the client_secret on the body request.
      */
    });
    return this.http
      .post<AuthorizationResponse>(this.backendAPI, params.toString(), {
        headers,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          //console.log(error.response); //INFO: This is the whole error (previous map doesn't affect)
          const description = error.response.data.error_description;
          console.log(
            `Status: ${error.response.status}\nError: ${error.response.data.error}\nDescription: ${description}\nError Codes: ${error.response.data.error_codes}`,
          );
          return throwError(error);
        }),
      );
  }

  delete_refresh_token(uuid: string) {
    return this.tokenService.deleteToken(uuid, 'refresh_token', 'onedrive');
  }
}
