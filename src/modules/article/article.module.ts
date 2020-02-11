import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleSchema } from './article.schema';
import { ArticleService } from './article.service';
import { ArticleController } from './controllers/article.controller';
import { MobileArticleController } from './controllers/mobile-article.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
  ],
  providers: [ArticleService],
  controllers: [ArticleController, MobileArticleController],
})
export class ArticleModule {}
