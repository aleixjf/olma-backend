import { ApiProperty } from '@nestjs/swagger';
import { classToPlain, Exclude } from 'class-transformer';

export class UserDTO {
  @ApiProperty()
  uuid?: string;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly surname_1: string;

  @ApiProperty()
  readonly surname_2?: string;

  @ApiProperty()
  readonly email: string;

  @Exclude({ toPlainOnly: true })
  @ApiProperty()
  readonly password?: string;

  @ApiProperty()
  readonly birth_date?: Date;

  constructor(
    uuid: string,
    name: string,
    surname_1: string,
    surname_2: string,
    email: string,
    password: string,
    birth_date: Date,
  ) {
    this.uuid = uuid;
    this.name = name;
    this.surname_1 = surname_1;
    this.surname_2 = surname_2;
    this.email = email;
    this.password = password;
    this.birth_date = birth_date;
  }

  toJSON() {
    return classToPlain(this);
  }
}
