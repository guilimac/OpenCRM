import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProblemDetailsExceptionFilter } from './infrastructure/adapters/primary/rest/filters/http-exception.filter.js';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Increase payload size limits for avatar images and attachments
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global prefix & versioning: /api/v1/...
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter for RFC 7807 problem details
  app.useGlobalFilters(new ProblemDetailsExceptionFilter());

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('OpenCRM Enterprise API')
    .setDescription(
      'RESTful API for OpenCRM Enterprise Platform built on NestJS with Hexagonal Architecture. Features multi-currency (BRL base), customer 360, sales pipeline, and JWT security.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 OpenCRM API running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Documentation at: http://localhost:${port}/api/docs`);
}
bootstrap();
