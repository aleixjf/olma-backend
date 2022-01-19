import { ApiProperty } from '@nestjs/swagger';

export class CredentialsDTO {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
