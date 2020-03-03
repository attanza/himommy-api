import { ArgsResourcePagination } from '@modules/shared/interfaces/resource-pagination.interface';
import { ResourcePaginationPipe } from '@modules/shared/pipes/resource-pagination.pipe';
import { Query, Resolver } from '@nestjs/graphql';
import { Args } from 'type-graphql';
import { OtPermission } from './permission.interface';
import { PermissionService } from './permission.service';

@Resolver()
export class PermissionResolver {
  modelName = 'Permission';
  uniques = ['name'];
  constructor(private readonly dbService: PermissionService) {}
  @Query(() => [OtPermission])
  async permissions(@Args() args: ArgsResourcePagination) {
    const query: ResourcePaginationPipe = Object.assign({}, args);
    return this.dbService.getPaginated({
      modelName: this.modelName,
      query,
    });
  }
}
