import { Injectable, NotFoundException } from '@nestjs/common';
import { VaultItemsRepository } from './vault-items.repository';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, EntityType , Prisma } from '@prisma/client';

import { logger } from '../../common/utils/logger';

import { createPaginationMeta } from '../../common/interfaces/pagination.interface';
import { FindVaultItemsDto } from './dto/find-vault-items.dto';

import { MESSAGES } from '../../common/constants/messages';

@Injectable()
export class VaultItemsService {
  constructor(
    private readonly vaultItemsRepository: VaultItemsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createVaultItemDto: CreateVaultItemDto, ownerId: string, ip: string) {
    const item = await this.vaultItemsRepository.create(createVaultItemDto, ownerId);

    this.auditLogsService.create({
      userId: ownerId,
      action: AuditAction.VAULT_ITEM_CREATE,
      entityType: EntityType.VAULT_ITEM,
      entityId: item.id,
      ipAddress: ip,
      metadata: {
        title: item.title,
        permissionCount: createVaultItemDto.permissions?.length ?? 0,
      },
    }).catch(err => {
      logger.error({ err, userId: ownerId, entityId: item.id }, 'Failed to create audit log');
    });

    return item;
  }

  async findAll(ownerId: string, query: FindVaultItemsDto) {
    const {
      page,
      limit,
      skip,
      search,
      type,
      nextPaymentDaysFrom,
      nextPaymentDaysTo,
      sortBy,
      order,
    } = query;

    const where: Prisma.VaultItemWhereInput = {
      vaultPermissions: {
        some: {
          userId: ownerId,
        },
      },
      deletedAt: null,
    };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (nextPaymentDaysFrom !== undefined || nextPaymentDaysTo !== undefined) {
      const now = new Date();
      const nextPaymentFilter: Prisma.DateTimeNullableFilter = {};

      if (nextPaymentDaysFrom !== undefined) {
        const fromDate = new Date();
        fromDate.setDate(now.getDate() + nextPaymentDaysFrom);
        nextPaymentFilter.gte = fromDate;
      }

      if (nextPaymentDaysTo !== undefined) {
        const toDate = new Date();
        toDate.setDate(now.getDate() + nextPaymentDaysTo);
        nextPaymentFilter.lte = toDate;
      }

      where.nextPaymentAt = nextPaymentFilter;
    }

    const orderBy: Prisma.VaultItemOrderByWithRelationInput = {};
    const allowedSortFields = ['type', 'title', 'amount', 'frequencyDays', 'nextPaymentAt'];

    if (sortBy && allowedSortFields.includes(sortBy)) {
      orderBy[sortBy as any] = order || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const { data, total } = await this.vaultItemsRepository.findAndCount({
      skip,
      take: limit,
      where,
      orderBy,
    });

    return {
      data,
      meta: createPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string, userId: string) {
    const item = await this.vaultItemsRepository.findById(id, userId);

    if (!item) {
      throw new NotFoundException(MESSAGES.VAULT_ITEM.NOT_FOUND);
    }

    const { vaultPermissions, ...itemData } = item;

    return {
      ...itemData,
      permissions: vaultPermissions.map((vp: any) => ({
        id: vp.id,
        userId: vp.user.id,
        email: vp.user.email,
        name: vp.user.name,
        canEdit: vp.canEdit,
      })),
    };
  }
}
