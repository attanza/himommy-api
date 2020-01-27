import { Controller, Get, Res } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(private seederService: SeederService) {}

  @Get()
  async seed(@Res() res) {
    await this.seederService.seedRole();
    // await this.seederService.seedPermission();
    res.status(200).send({ message: 'Seed Succeed' });
  }
}
