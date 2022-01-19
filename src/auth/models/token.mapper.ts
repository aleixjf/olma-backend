import { TokenDTO } from './token.dto';
import { AccessTokenEntity } from './access-token.entity';
import { RefreshTokenEntity } from './refresh-token.entity';

export class TokenMapper {
  dtoToEntity(
    tokenDTO: TokenDTO,
    type: 'access_token' | 'refresh_token',
  ): AccessTokenEntity | RefreshTokenEntity {
    if (type === 'access_token')
      return new AccessTokenEntity(
        tokenDTO.uuid,
        tokenDTO.jwt,
        tokenDTO.issued_date,
        undefined,
        tokenDTO.expiration_date,
        tokenDTO.provider,
        tokenDTO.revoked,
      );
  }

  entityToDto(tokenEntity: AccessTokenEntity | RefreshTokenEntity): TokenDTO {
    return new TokenDTO(
      tokenEntity.uuid,
      tokenEntity.jwt,
      tokenEntity.issued_date,
      undefined,
      tokenEntity.expiration_date,
      tokenEntity.provider,
      tokenEntity.revoked,
    );
  }
}
