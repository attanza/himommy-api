import { Module } from '@nestjs/common';
import { FrontEndUtilController } from './front-end-util.controller';

@Module({
  controllers: [FrontEndUtilController]
})
export class FrontEndUtilModule {}
