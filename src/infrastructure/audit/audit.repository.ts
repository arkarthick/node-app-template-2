import { db } from '../database/drizzle/client';
import { auditLogs } from '../database/drizzle/schema';

export class AuditRepository {
  async create(data: typeof auditLogs.$inferInsert) {
    await db.insert(auditLogs).values(data);
  }
}

export const auditRepository = new AuditRepository();
