import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@Res() res: Response) {
    return res.render('index');
  }

  @Get('/email')
  emailTest(@Res() res: Response) {
    return res.render('emails/confirmEmail', { confimationLink: 'test' });
  }
}
