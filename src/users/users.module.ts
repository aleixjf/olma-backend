//Nest
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

//Modules + Controllers
import { AuthModule } from 'src/auth/auth.module';
import { ProfileController } from './controllers/profile.controller';
import { UsersController } from './controllers/users.controller';

//Entities
import { UserMapper } from './models/user.mapper';
import { UserEntity } from './models/user.entity';

//Services
import { UsersService } from './services/users.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [UsersService, UserMapper],
  controllers: [ProfileController, UsersController],
  exports: [UsersService],
})
export class UsersModule {}
