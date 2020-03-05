import { SetMetadata } from '@nestjs/common';

export const Role = (role: string | string[]) => SetMetadata('role', role);
