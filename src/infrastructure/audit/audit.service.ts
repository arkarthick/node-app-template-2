import { getRequestContext } from '@/common/middleware/request-context.middleware';
import { auditRepository } from '@/infrastructure/audit/audit.repository';

export interface AuditLogOptions {
  entityType: string;
  entityId?: string;
  action: string;
  metadata?: any;
}

export class AuditService {
  async log({ entityType, entityId, action, metadata }: AuditLogOptions) {
    const context = getRequestContext();

    await auditRepository.create({
      entityType,
      entityId,
      action,
      metadata: metadata || {},
      performedBy: context?.userId,
      requestId: context?.requestId,
      ipAddress: context?.ipAddress,
    });
  }
}

export const auditService = new AuditService();
