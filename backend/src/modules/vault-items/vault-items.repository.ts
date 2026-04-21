import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';

import { Prisma } from '@prisma/client';

@Injectable()
export class VaultItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVaultItemDto, ownerId: string) {
    const { permissions, ...itemData } = data;

    // Filter out ownerId if it's already in permissions to avoid unique constraint error
    const otherPermissions = permissions?.filter((p) => p.userId !== ownerId) || [];

    return this.prisma.vaultItem.create({
      data: {
        ...itemData,
        ownerId,
        vaultPermissions: {
          create: [
            { userId: ownerId, canEdit: true },
            ...otherPermissions.map((p) => ({
              userId: p.userId,
              canEdit: p.canEdit ?? false,
            })),
          ],
        },
      },
      include: {
        vaultPermissions: true,
      },
    });
  }

  async findAndCount(params: {
    skip: number;
    take: number;
    where: Prisma.VaultItemWhereInput;
    orderBy: Prisma.VaultItemOrderByWithRelationInput;
  }) {
    const [data, total] = await Promise.all([
      this.prisma.vaultItem.findMany({
        ...params,
        select: {
          id: true,
          type: true,
          title: true,
          amount: true,
          frequencyDays: true,
          nextPaymentAt: true,
        },
      }),
      this.prisma.vaultItem.count({ where: params.where }),
    ]);

    return { data, total };
  }

  async findById(id: string, requesterId: string) {
    if (!requesterId) {
      throw new UnauthorizedException("requesterId is required");
    }
    
    return this.prisma.vaultItem.findFirst({
      where: {
        id,
        vaultPermissions: {
          some: {
            userId: requesterId,
          },
        },
        deletedAt: null,
      },
      include: {
        vaultPermissions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
