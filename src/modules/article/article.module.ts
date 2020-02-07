import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleController } from './article.controller';
import { ArticleSchema } from './article.schema';
import { ArticleService } from './article.service';
import { MobileArticleController } from './mobile-article.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
  ],
  providers: [ArticleService],
  controllers: [ArticleController, MobileArticleController],
})
export class ArticleModule {}
