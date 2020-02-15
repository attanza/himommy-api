import { BadRequestException, Controller, Get, Res } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(private seederService: SeederService) {}

  @Get()
  async seed(@Res() res) {
    this.checkEnv();
    Promise.all([
      this.seederService.seedUserRolePermission(),
      this.seederService.seedAppVersion(),
      this.seederService.seedTocologistService(),
      this.seederService.seedTocologist(),
      this.seederService.seedArticle(),
      this.seederService.seedCheckList(),
      this.seederService.seedQuestions(),
    ]);
    res.status(200).send({ message: 'Seed Succeed' });
  }

  @Get('/generate-tocologist-user')
  async generateTocologistUser(@Res() res) {
    this.checkEnv();
    this.seederService.seedTocologistUser();
    res.status(200).send({ message: 'Seed Succeed' });
  }

  private checkEnv() {
    const NODE_ENV = process.env.NODE_ENV;
    const SEED = process.env.SEED;
    if (NODE_ENV !== 'development' && SEED !== '1') {
      throw new BadRequestException('Seeding may only works on development');
    }
  }
}
