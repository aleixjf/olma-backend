/*
JWT Documentation:
https://docs.oracle.com/cloud/live-experience-cloud/WSCAD/ddd_lxauth.htm
*/

//Nest
import { UnprocessableEntityException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { JwtPayload, SignOptions, TokenExpiredError } from 'jsonwebtoken';

//Models + Entities
import { RefreshTokenEntity } from '../models/refresh-token.entity';
import { AccessTokenEntity } from '../models/access-token.entity';

import { UserDTO } from 'src/users/models/user.dto';
import { UserEntity } from 'src/users/models/user.entity';

//Services
import { UsersService } from 'src/users/services/users.service';

export interface RefreshTokenPayload {
  jti: string;
  sub: string;
}

@Injectable()
export class TokenService {
  common_options: SignOptions;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(AccessTokenEntity)
    private accessTokensRepository: Repository<AccessTokenEntity>,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokensRepository: Repository<RefreshTokenEntity>,
  ) {
    this.common_options = {
      issuer: `https://${this.configService.get<string>('app.url')}`,
      audience: `https://${this.configService.get<string>('app.url')}`,
    };
  }

  async signToken(
    user: UserDTO | string,
    type: 'access_token' | 'refresh_token',
  ): Promise<string> {
    const uuid: string = typeof user === 'object' ? user.uuid : user;
    const options: SignOptions = {
      ...this.common_options,
      subject: uuid,
      jwtid: uuid, //TO-DO: generate unique id (uuid) for each token! We're currently using the user's uuid, but wrong when storing multiple tokens.
      expiresIn:
        type == 'access_token'
          ? this.configService.get<string>('token.short_lived')
          : this.configService.get<string>('token.long_lived'),
    };

    return this.jwtService.signAsync({}, options);
    /*
    INFO: This returns a string, which is a JWT encoded.
    The info it contains when decrypted with our secret key is:
    1. Header (Algorithm & Token Type)
    {
      'alg': 'HS256', //Signature or encryptation algorithm
      'typ': 'JWT' //Type of Token https://www.iana.org/assignments/media-types/media-types.xhtml
    }
    2. Payload
    {
      "iat": 1639659404, //Timestamp of the time the JWT was issued/expedited. //Seconds from 01/01/1970
      "exp": 1639832204, //Timestamp of the moment the JWT will expire. //Seconds from 01/01/1970
      "aud": "https://olma.com", //Audience: Who or what the token is intended for
      "iss": "https://olma.com", //Issuer: Who created and signed this token
      "sub": "ccfae16b-0d6e-47f0-a463-8496814ef2ab" //Subject: Who the token refer to (the user for which is intended)
      "jti": uuid of this token //Token identifier
    }
    3. Verify signature
    */
  }

  async createToken(
    user: UserDTO | string,
    jwt: string,
    type: 'access_token' | 'refresh_token' = 'refresh_token',
    issued_date?: Date,
    duration?: number,
    expiration_date?: Date,
    provider?: string,
  ): Promise<AccessTokenEntity | RefreshTokenEntity | null> {
    const uuid: string = typeof user === 'object' ? user.uuid : user;

    let decoded_jwt: JwtPayload | string | null;
    let token: AccessTokenEntity | RefreshTokenEntity;
    if (!provider || provider == 'olma') {
      decoded_jwt = this.jwtService.decode(jwt);
    }
    if (typeof decoded_jwt == 'object' && decoded_jwt.sub) {
      if (type === 'access_token') {
        //console.dir(decoded_jwt);
        token = new AccessTokenEntity(
          decoded_jwt.sub,
          jwt,
          decoded_jwt.iat ? new Date(decoded_jwt.iat * 1000) : undefined,
          undefined,
          decoded_jwt.exp ? new Date(decoded_jwt.exp * 1000) : undefined,
          provider,
          false,
        );
        //console.dir(token);
      } else {
        //console.dir(decoded_jwt);
        token = new RefreshTokenEntity(
          decoded_jwt.sub,
          jwt,
          decoded_jwt.iat ? new Date(decoded_jwt.iat * 1000) : undefined,
          undefined,
          decoded_jwt.exp ? new Date(decoded_jwt.exp * 1000) : undefined,
          provider,
          false,
        );
        //console.dir(token);
      }
    } else {
      if (type === 'access_token') {
        //console.dir(decoded_jwt);
        token = new AccessTokenEntity(
          uuid,
          jwt,
          issued_date,
          duration,
          expiration_date,
          provider,
          false,
        );
        //console.dir(token);
      } else {
        //console.dir(decoded_jwt);
        token = new RefreshTokenEntity(
          uuid,
          jwt,
          issued_date,
          duration,
          expiration_date,
          provider,
          false,
        );
        //console.dir(token);
      }
    }

    return this.registerToken(token, type);
  }

  async createOAuthTokens(uuid: string) {
    /* Access Token */
    const access_token_jwt = await this.signToken(uuid, 'access_token');
    const access_token = await this.createToken(
      uuid,
      access_token_jwt,
      'access_token',
    );

    /* Refresh Token */
    const refresh_token_jwt = await this.signToken(uuid, 'refresh_token');
    const refresh_token = await this.createToken(
      uuid,
      refresh_token_jwt,
      'refresh_token',
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshOAuthTokens(refresh: string) {
    const { user } = await this.resolveRefreshToken(refresh);
    return this.createOAuthTokens(user.uuid);
  }

  async registerToken(
    token: AccessTokenEntity | RefreshTokenEntity,
    type: 'access_token' | 'refresh_token',
  ): Promise<AccessTokenEntity | RefreshTokenEntity | null> {
    if (type == 'access_token') {
      const result = await this.findToken(
        token.uuid,
        'access_token',
        token.provider,
      );
      if (result) {
        await this.accessTokensRepository.update(result, token);
        return this.findToken(token.uuid, 'access_token', token.provider);
      }
      return this.accessTokensRepository.save(token);
    } else {
      const result = await this.findToken(
        token.uuid,
        'refresh_token',
        token.provider,
      );
      if (result) {
        await this.refreshTokensRepository.update(result, token);
        return this.findToken(token.uuid, 'refresh_token', token.provider);
      }
      return this.refreshTokensRepository.save(token);
    }
  }

  async findToken(
    user: UserDTO | string,
    type: 'access_token' | 'refresh_token',
    provider = 'olma',
  ): Promise<AccessTokenEntity | RefreshTokenEntity | null> {
    const uuid: string = typeof user === 'object' ? user.uuid : user;
    return type == 'access_token'
      ? this.accessTokensRepository.findOne({ uuid, provider })
      : this.refreshTokensRepository.findOne({ uuid, provider });
  }

  deleteToken(
    user: UserDTO | string,
    type: 'access_token' | 'refresh_token',
    provider = 'olma',
  ): Promise<DeleteResult> {
    const uuid: string = typeof user === 'object' ? user.uuid : user;
    return type == 'access_token'
      ? this.accessTokensRepository.delete({ uuid, provider })
      : this.refreshTokensRepository.delete({ uuid, provider });
  }

  async resolveRefreshToken(
    encoded: string,
  ): Promise<{ user: UserDTO; token: RefreshTokenEntity }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    if (token.revoked) {
      throw new UnprocessableEntityException('Refresh token is revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);
    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return { user, token };
  }

  private async decodeRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token has expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  private async getUserFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<UserEntity | null> {
    const subId = payload.sub;

    if (!subId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.usersService.getUser(subId);
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<RefreshTokenEntity | null> {
    const tokenId = payload.jti;

    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.findToken(tokenId, 'refresh_token');
  }
}
