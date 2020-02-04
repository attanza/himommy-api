import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<string[]>(
      'permission',
      context.getHandler(),
    );
    console.log('permission', permission);
    if (!permission) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userPermissions = request.user.role.permissions;
    if (!userPermissions) {
      return false;
    }
    let permissions = [];
    userPermissions.map(p => permissions.push(p.slug));
    console.log('permissions', permissions);
    return permissions.includes(permission);
  }
}
