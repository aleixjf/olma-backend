//Nest
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

//App
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './shared/filters/type-orm-exception.filter';
import * as csurf from 'csurf';

import * as fs from 'fs';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

const cert = 'config/cert.pem';
const key = 'config/key.pem';
const httpsOptions: HttpsOptions = {};

if (fs.existsSync(cert) && fs.existsSync(key)) {
  httpsOptions.cert = fs.readFileSync(cert);
  httpsOptions.key = fs.readFileSync(key);
} else if (process.env.APP_CERT && process.env.APP_KEY) {
  httpsOptions.cert = process.env.APP_CERT;
  httpsOptions.key = process.env.APP_KEY;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true, httpsOptions });
  app.setGlobalPrefix('api'); //INFO: This is so that all our routes have the api prefix: https://url/api/controller
  //app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new TypeOrmExceptionFilter());
  app.use(csurf());
  const configService = app.get(ConfigService);

  const options = new DocumentBuilder()
    .setTitle('OLMA Backend')
    .setDescription('OLMA public API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(configService.get('app.port'));
}
bootstrap();
