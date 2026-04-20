import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import { logger } from './common/utils/logger';
dotenv.config();

import { fastifyAdapter } from './common/configs/fastify.config';
import { helmetConfig } from './common/configs/helmet.config';
import { validationPipeConfig } from './common/configs/validation-pipe.config';

const PORT = process.env.PORT ?? 5000;

//  @TODO - RATE LIMITER
//  @TODO - CSFR TOKEN

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  app.enableShutdownHooks();

  await app.register(helmet, helmetConfig);

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET, 
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));

  await app.listen(PORT, '0.0.0.0'); 
  logger.info(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
