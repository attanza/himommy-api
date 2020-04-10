import { Role } from '@guards/role.decorator';
import { RoleGuard } from '@guards/role.guard';
import { apiItem } from '@modules/helpers/responseParser';
import { IApiItem } from '@modules/shared/interfaces/response-parser.interface';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IComboDataQuery } from './combo-data.interface';
import { ComboDataService } from './combo-data.service';
@Controller('admin/combo-data')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class ComboDataController {
  constructor(private readonly service: ComboDataService) {}
  @Get()
  @Role(['super-administrator', 'administrator'])
  async index(@Query() query: IComboDataQuery): Promise<IApiItem> {
    const { resource } = query;
    switch (resource) {
      case 'role':
        return apiItem('Roles', await this.service.getRole());
      case 'permission':
        return apiItem('Permission', await this.service.getPermission());
    
      default:
        return apiItem('Resource unknown', null);
    }
  }
}
