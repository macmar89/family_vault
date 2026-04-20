import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { VaultItemsModule } from './modules/vault-items/vault-items.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    RefreshTokenModule,
    VaultItemsModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
