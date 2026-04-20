import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';

@Injectable()
export class VaultItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVaultItemDto, ownerId: string) {
    const { permissions, ...itemData } = data;

    return this.prisma.vaultItem.create({
      data: {
        ...itemData,
        ownerId,
        vaultPermissions: {
          create: permissions?.map((p) => ({
            userId: p.userId,
            canEdit: p.canEdit ?? false,
          })),
        },
      },
      include: {
        vaultPermissions: true,
      },
    });
  }
}
