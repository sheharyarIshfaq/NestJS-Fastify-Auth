import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import multipart from '@fastify/multipart';
import { FastifyInstance } from 'fastify';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    logger: true,
    trustProxy: true,
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );
  
  const fastifyInstance = app.getHttpAdapter().getInstance() as FastifyInstance;
  await fastifyInstance.register(multipart);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  
  console.log(`🚀🚀 SERVER UP AND RUNNING ON PORT ${port} 🚀🚀`);
}

bootstrap();