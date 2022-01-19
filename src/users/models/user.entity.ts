import { Exclude, classToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccessTokenEntity } from 'src/auth/models/access-token.entity';
import { RefreshTokenEntity } from 'src/auth/models/refresh-token.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly uuid: string;

  @Column({ length: 55 })
  readonly name: string;

  @Column({ length: 55 })
  readonly surname_1: string;

  @Column({ length: 55, nullable: true })
  readonly surname_2: string;

  @Column({ unique: true })
  readonly email: string;

  @Exclude({ toPlainOnly: true }) //INFO: This + classToPlain allows us to send the user with passwird within the backend, but when transformed to JSON for the front-end, not to have the password displayed
  @Column({ type: 'varchar', length: 70 })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  @BeforeUpdate()
  async hashPasswordUpdate() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compareSync(password, this.password);
  }

  @Column({ nullable: true })
  readonly birth_date: Date;

  @OneToMany(() => AccessTokenEntity, (token) => token.uuid)
  readonly access_tokens: AccessTokenEntity[];

  @OneToMany(() => RefreshTokenEntity, (token) => token.uuid)
  readonly refresh_tokens: RefreshTokenEntity[];

  constructor(
    uuid: string,
    name: string,
    surname_1: string,
    surname_2: string,
    email: string,
    password: string,
    birth_date: Date,
  ) {
    super();
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
