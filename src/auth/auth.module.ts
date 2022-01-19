//Nest
import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

//Modules + Controllers
import { UsersModule } from '../users/users.module';

import { AuthController } from './controllers/auth.controller';
import { ProfileController } from '../users/controllers/profile.controller';

import { OAuthController } from './controllers/oauth.controller';
import { DropboxOAuthController } from './controllers/dropbox.oauth.controller';
import { OneDriveOAuthController } from './controllers/onedrive.oauth.controller';
import { SpotifyOAuthController } from './controllers/spotify.oauth.controller';

//Entities
import { TokenMapper } from './models/token.mapper';
import { AccessTokenEntity } from './models/access-token.entity';
import { RefreshTokenEntity } from './models/refresh-token.entity';

//Services
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { DropboxService } from './services/dropbox.service';
import { OneDriveService } from './services/onedrive.service';
import { SpotifyService } from './services/spotify.service';

//Strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
//import { GoogleStrategy } from './strategies/google.strategy';
import { SpotifyStrategy } from './strategies/spotify.strategy';

//Guards
import { JwtGuard } from 'src/shared/guards/jwt.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    HttpModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('token.secret'),
      }),
    }),
    TypeOrmModule.forFeature([AccessTokenEntity, RefreshTokenEntity]),
  ],
  providers: [
    /* Services */
    AuthService,
    TokenService,
    DropboxService,
    OneDriveService,
    SpotifyService,
    TokenMapper,

    /* Strategies */
    LocalStrategy,
    JwtStrategy,
    JwtGuard,
    //GoogleStrategy,
    SpotifyStrategy,
  ],
  controllers: [
    AuthController,
    OAuthController,
    DropboxOAuthController,
    OneDriveOAuthController,
    SpotifyOAuthController,
  ],
  exports: [AuthService],
})
export class AuthModule {}
