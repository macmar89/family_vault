import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemType } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class FindVaultItemsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ItemType)
  type?: ItemType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nextPaymentDaysFrom?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nextPaymentDaysTo?: number;
}
