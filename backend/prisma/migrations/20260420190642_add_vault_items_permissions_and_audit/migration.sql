/*
  Warnings:

  - You are about to drop the column `userId` on the `VaultItem` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `VaultItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'VAULT_ITEM_CREATE', 'VAULT_ITEM_READ', 'VAULT_ITEM_DECRYPT', 'VAULT_ITEM_UPDATE', 'VAULT_ITEM_DELETE', 'PERMISSION_GRANT', 'PERMISSION_REVOKE');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'AUTH', 'VAULT_ITEM');

-- DropForeignKey
ALTER TABLE "VaultItem" DROP CONSTRAINT "VaultItem_userId_fkey";

-- DropIndex
DROP INDEX "VaultItem_userId_idx";

-- DropIndex
DROP INDEX "VaultItem_userId_type_idx";

-- AlterTable
ALTER TABLE "VaultItem" DROP COLUMN "userId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "VaultPermission" (
    "id" TEXT NOT NULL,
    "vaultItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaultPermission_vaultItemId_userId_key" ON "VaultPermission"("vaultItemId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "VaultItem_ownerId_idx" ON "VaultItem"("ownerId");

-- CreateIndex
CREATE INDEX "VaultItem_ownerId_type_idx" ON "VaultItem"("ownerId", "type");

-- AddForeignKey
ALTER TABLE "VaultItem" ADD CONSTRAINT "VaultItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultPermission" ADD CONSTRAINT "VaultPermission_vaultItemId_fkey" FOREIGN KEY ("vaultItemId") REFERENCES "VaultItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultPermission" ADD CONSTRAINT "VaultPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
