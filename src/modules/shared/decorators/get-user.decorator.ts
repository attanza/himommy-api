import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
export const GetUser = createParamDecorator((_, req: Request) => {
  return req.user;
});
