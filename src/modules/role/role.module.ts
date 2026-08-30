// src/modules/role/role.module.ts
import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [PermissionModule], // <-- và thiếu dòng này
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
