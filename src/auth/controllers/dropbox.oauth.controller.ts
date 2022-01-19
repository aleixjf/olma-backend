//Nest
import { Controller, Get, UseGuards, Request, Delete } from '@nestjs/common';

//Models + Entities
import { AccessTokenEntity } from '../models/access-token.entity';

//Services
import { DropboxService } from 'src/auth/services/dropbox.service';

//Guards
import { JwtGuard } from 'src/shared/guards/jwt.guard';

@Controller('oauth/dropbox')
export class DropboxOAuthController {
  constructor(private dropboxService: DropboxService) {}

  @UseGuards(JwtGuard)
  @Get('refresh')
  async refreshToken(@Request() req): Promise<AccessTokenEntity> {
    return this.dropboxService.get_refreshed_token(req.user.uuid);
  }

  @UseGuards(JwtGuard)
  @Delete()
  async deleteRefreshToken(@Request() req) {
    return this.dropboxService.delete_refresh_token(req.user.uuid);
  }
}
