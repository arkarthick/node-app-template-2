import { db } from '@/infrastructure/database/drizzle/client';
import { auditLogs, NewAuditLog } from '@/infrastructure/database/drizzle/schema';

export class AuditRepository {
  async create(data: NewAuditLog) {
    await db.insert(auditLogs).values(data);
  }
}

export const auditRepository = new AuditRepository();
