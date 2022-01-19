//Nest
import { Controller, Get, UseGuards, Request, Delete } from '@nestjs/common';

//Models + Entities
import { AccessTokenEntity } from '../models/access-token.entity';

//Services
import { OneDriveService } from 'src/auth/services/onedrive.service';

//Guards
import { JwtGuard } from 'src/shared/guards/jwt.guard';

@Controller('oauth/onedrive')
export class OneDriveOAuthController {
  constructor(private oneDriveService: OneDriveService) {}

  @UseGuards(JwtGuard)
  @Get('refresh')
  async refreshToken(@Request() req): Promise<AccessTokenEntity> {
    return this.oneDriveService.get_refreshed_token(req.user.uuid);
  }

  @UseGuards(JwtGuard)
  @Delete()
  async deleteRefreshToken(@Request() req) {
    return this.oneDriveService.delete_refresh_token(req.user.uuid);
  }
}
