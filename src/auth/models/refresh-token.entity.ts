import * as bcrypt from 'bcrypt';
import {
  BaseEntity,
  Column,
  PrimaryColumn,
  Entity,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { UserEntity } from 'src/users/models/user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends BaseEntity {
  @Column('uuid')
  readonly uuid: string;

  @ManyToOne(() => UserEntity, (user) => user.refresh_tokens, {
    cascade: true,
  })
  readonly user: UserEntity;

  @PrimaryColumn()
  jwt: string;

  /*
  INFO: If hashed, we can't use Tokens anymore, the can't be decoded. 
  This is more secure, but it's seless for us, since we need to retrieve the 3rd party Tokens.

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.jwt = await bcrypt.hash(this.jwt, salt);
  }
  @BeforeUpdate()
  async hashPasswordUpdate() {
    const salt = await bcrypt.genSalt();
    this.jwt = await bcrypt.hash(this.jwt, salt);
  }
  async validateToken(token: string): Promise<boolean> {
    return bcrypt.compareSync(token, this.jwt);
  }
  */

  @Column()
  readonly provider: string;

  @Column({ type: 'timestamptz' })
  readonly issued_date: Date;

  @Column('bool')
  readonly expires: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  readonly expiration_date: Date;

  @Column('bool')
  readonly revoked: boolean;

  constructor(
    uuid: string,
    jwt: string,
    issued_date?: Date,
    expires_in?: number, //seconds
    expiration_date?: Date,
    provider?: string,
    revoked?: boolean,
  ) {
    super();
    this.uuid = uuid;
    this.jwt = jwt;
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
