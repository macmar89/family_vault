import { IsEnum, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemType } from '@prisma/client';

export class VaultItemPermissionDto {
  @IsString()
  userId: string;

  @IsBoolean()
  @IsOptional()
  canEdit?: boolean = false;
}

export class CreateVaultItemDto {
  @IsEnum(ItemType)
  type: ItemType;

  @IsString()
  title: string;

  @IsString()
  encryptedData: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  frequencyDays?: number;

  @IsString()
  @IsOptional()
  nextPaymentAt?: string;

  @IsArray()
  @ValidateNested({each: true })
  @Type(() => VaultItemPermissionDto)
  permissions: VaultItemPermissionDto[];
}
