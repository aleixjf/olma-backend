import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseType } from 'typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { configuration, validate } from 'config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        `config/env/${process.env.NODE_ENV}.env`,
        'config/env/.env',
      ],
      load: [configuration],
      validate,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        //type: configService.get<DatabaseType>('database.type'),
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        cli: { migrationsDir: './migrations' },
        migrations: ['dist/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        autoLoadEntities: true,
        //synchronize: true,
        //keepConnectionAlive: true,
        logging: true,
        ssl: process.env.NODE_ENV == 'development' ? false : true,

        /*
        ssl:
          process.env.NODE_ENV == 'development'
            ? false
            : {
                rejectUnauthorized: true,
              },
        */
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
