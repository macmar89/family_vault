import { Module } from '@nestjs/common';
import { VaultItemsController } from './vault-items.controller';
import { VaultItemsService } from './vault-items.service';
import { VaultItemsRepository } from './vault-items.repository';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [VaultItemsController],
  providers: [VaultItemsService, VaultItemsRepository],
  exports: [VaultItemsService],
})
export class VaultItemsModule {}
