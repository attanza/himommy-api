import { IUser } from '@modules/user/user.interface';
import { createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (_, req): IUser => {
    return req.user;
  },
);
