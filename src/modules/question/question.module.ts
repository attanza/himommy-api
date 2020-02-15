import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MobileQuestionController } from './controllers/mobile-question.controller copy';
import { QuestionController } from './controllers/question.controller';
import { QuestionSchema } from './question.schema';
import { QuestionService } from './question.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Question', schema: QuestionSchema }]),
  ],
  controllers: [QuestionController, MobileQuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
