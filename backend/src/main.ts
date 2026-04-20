import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT ?? 5000;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       
      forbidNonWhitelisted: true, 
      transform: true,       
    }),
  );

  await app.listen(PORT, '0.0.0.0'); 
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
