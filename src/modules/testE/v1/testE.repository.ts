import { eq } from 'drizzle-orm';
import { db } from '@/infrastructure/database/drizzle/client';
// import { yourTable } from '@/infrastructure/database/drizzle/schema';

export class TesteRepository {
  async findById(id: string) {
    // Implementation
    return null;
  }
}

export const testeRepository = new TesteRepository();
