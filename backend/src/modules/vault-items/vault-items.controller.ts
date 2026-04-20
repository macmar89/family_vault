import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VaultItemsService } from './vault-items.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

@Controller('vault-items')
@UseGuards(JwtAuthGuard)
export class VaultItemsController {
  constructor(private readonly service: VaultItemsService) {}

  @Post()
  async create(
    @Body() createVaultItemDto: CreateVaultItemDto,
    @GetCurrentUser('userId') ownerId: string,
  ) {
    return this.service.create(createVaultItemDto, ownerId);
  }
}
