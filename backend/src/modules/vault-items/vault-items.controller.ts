import { Controller, Post, Get, Body, Query, Param, Ip, UseGuards } from '@nestjs/common';
import { VaultItemsService } from './vault-items.service';
import { CreateVaultItemDto } from './dto/create-vault-item.dto';
import { FindVaultItemsDto } from './dto/find-vault-items.dto';
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
    @Ip() ip: string,
  ) {
    return this.service.create(createVaultItemDto, ownerId, ip);
  }

  @Get()
  async findAll(
    @Query() query: FindVaultItemsDto,
    @GetCurrentUser('userId') ownerId: string,
  ) {
    return this.service.findAll(ownerId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetCurrentUser('userId') userId: string) {
    return this.service.findOne(id, userId);
  }
}
