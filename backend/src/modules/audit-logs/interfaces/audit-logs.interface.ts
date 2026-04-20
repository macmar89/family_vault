import { AuditAction, EntityType } from '@prisma/client';

export interface CreateAuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}
