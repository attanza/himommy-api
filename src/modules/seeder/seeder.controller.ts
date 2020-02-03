import { Controller, Get, Res } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(private seederService: SeederService) {}

  @Get()
  async seed(@Res() res) {
    const NODE_ENV = process.env.NODE_ENV;
    const SEED = process.env.SEED;
    if (NODE_ENV === 'development' && SEED === '1') {
      Promise.all([
        this.seederService.seedUserRolePermission(),
        this.seederService.seedAppVersion(),
        this.seederService.seedTocologistService(),
      ]);
      res.status(200).send({ message: 'Seed Succeed' });
    } else {
      res
        .status(200)
        .send({ message: 'Seeding may only works on development' });
    }
  }
}
