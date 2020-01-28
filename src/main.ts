import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import 'module-alias/register';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './modules/shared/http-exception.filter';

async function bootstrap() {
  const port = process.env.PORT || 2500;
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);
  Logger.log(`Server running at http://localhost:${port}`);
}
bootstrap();
