//Nest
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';

//Models + Entities
import { TokenMapper } from 'src/auth/models/token.mapper';
import { TokenDTO } from 'src/auth/models/token.dto';
import { RefreshTokenEntity } from '../models/refresh-token.entity';

//Services
import { AuthService } from '../services/auth.service';
import { TokenService } from 'src/auth/services/token.service';

//Guards
import { JwtGuard } from 'src/shared/guards/jwt.guard';
//import { LocalAuthGuard } from './local.guard';

@Controller('oauth')
export class OAuthController {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private mapper: TokenMapper,
  ) {}

  @Post('/refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    console.log(body.refresh_token);
    const tokens = await this.tokenService.refreshOAuthTokens(
      body.refresh_token,
    );
    return {
      olma: tokens.access_token,
      olma_refresh: tokens.refresh_token,
    };
  }

  @Get('/tokens')
  @UseGuards(JwtGuard)
  async getTokens(@Request() req) {
    return this.authService.get_third_party_tokens(req.user.uuid);
  }

  @Post('/token')
  @UseGuards(JwtGuard)
  async storeRefreshToken(
    @Body() token: TokenDTO,
  ): Promise<RefreshTokenEntity> {
    return this.tokenService.createToken(
      token.uuid,
      token.jwt,
      'refresh_token',
      token.issued_date,
      undefined,
      token.expiration_date,
      token.provider,
    );
  }
}
