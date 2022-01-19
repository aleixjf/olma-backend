import { ApiProperty } from '@nestjs/swagger';

export class TokenDTO {
  @ApiProperty()
  readonly uuid: string;

  @ApiProperty()
  readonly provider: string;

  @ApiProperty()
  readonly jwt: string; //INFO: This will be the access or the refresh token. It will be stored on one table or on another

  @ApiProperty()
  readonly issued_date: Date;

  @ApiProperty()
  readonly expires: boolean;

  @ApiProperty()
  readonly expiration_date?: Date;

  @ApiProperty()
  readonly revoked: boolean;

  constructor(
    uuid: string,
    jwt: string,
    //token_type: string,
    issued_date?: Date,
    expires_in?: number, //seconds
    expiration_date?: Date,
    provider?: string,
    revoked?: boolean,
  ) {
    this.uuid = uuid;
    this.jwt = jwt;
    //this.token_type = token_type;
    this.issued_date = issued_date ? issued_date : new Date();
    if (expiration_date) {
      this.expiration_date = expiration_date;
      this.expires = true;
    } else if (expires_in && !expiration_date) {
      this.expires = true;
      this.expiration_date = new Date(
        this.issued_date.getTime() + expires_in * 1000,
      );
    } else {
      this.expires = false;
    }
    this.provider = provider ? provider : 'olma';
    this.revoked = revoked ? revoked : false;
  }
}
