import { Controller, Post, Get, Body, Query, Param, Ip, UseGuards } from '@nestjs/common';
import { VaultItemsService } from './vault-items.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { FindVaultItemsDto } from './dto/find-vault-items.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { VaultKey } from './decorators/vault-key.decorator';

@Controller('vault-items')
@UseGuards(JwtAuthGuard)
export class VaultItemsController {
  constructor(private readonly service: VaultItemsService) {}

  @Post()
  async create(
    @Body() createVaultItemDto: CreateVaultItemDto,
    @GetCurrentUser('userId') ownerId: string,
    @Ip() ip: string,
    @VaultKey() key: Buffer,
  ) {
    return this.service.create(createVaultItemDto, ownerId, ip, key);
  }

  @Get()
  async findAll(
    @Query() query: FindVaultItemsDto,
    @GetCurrentUser('userId') ownerId: string,
    @VaultKey() key: Buffer, // might be needed if they return decrypted summaries, though usually we don't. We'll pass it just in case.
  ) {
    return this.service.findAll(ownerId, query, key);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string, 
    @GetCurrentUser('userId') userId: string,
    @VaultKey() key: Buffer,
  ) {
    return this.service.findOne(id, userId, key);
  }
}
