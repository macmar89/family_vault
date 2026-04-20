import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository';
import { CreateAuditLogParams } from './interfaces/audit-logs.interface';

@Injectable()
export class AuditLogsService {
  constructor(private readonly repository: AuditLogsRepository) {}

  async create(params: CreateAuditLogParams) {
    return this.repository.create(params);
  }
}
