import { Injectable } from '@nestjs/common';
import { VaultItemsRepository } from './vault-items.repository';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, EntityType } from '@prisma/client';

@Injectable()
export class VaultItemsService {
  constructor(
    private readonly vaultItemsRepository: VaultItemsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createVaultItemDto: CreateVaultItemDto, ownerId: string) {
    const item = await this.vaultItemsRepository.create(createVaultItemDto, ownerId);

    this.auditLogsService.create({
      userId: ownerId,
      action: AuditAction.VAULT_ITEM_CREATE,
      entityType: EntityType.VAULT_ITEM,
      entityId: item.id,
      metadata: {
        title: item.title,
        permissionCount: createVaultItemDto.permissions?.length ?? 0,
      },
    }).catch(err => {
      console.error('Failed to create audit log:', err);
    });

    return item;
  }
}
