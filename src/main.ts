import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import 'dotenv/config';
import * as exphbs from 'express-handlebars';
import 'module-alias/register';
import { join } from 'path';
import { AppModule } from './app.module';
import MqttHandler from './modules/helpers/mqttHandler';
import { AllExceptionsFilter } from './modules/shared/http-exception.filter';

async function bootstrap() {
  const port = process.env.PORT || 2500;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  MqttHandler.connect();
  app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main' }));
  app.set('view engine', '.hbs');

  await app.listen(port);
  Logger.log(`Server running at http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
