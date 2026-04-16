import { eq } from 'drizzle-orm';
import { db } from '@/infrastructure/database/drizzle/client';
import { users, User, NewUser } from '@/infrastructure/database/drizzle/schema';
import { CreateUserDTO } from './user.dto';

export class UserRepository {
  async create(data: CreateUserDTO) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
}

export const userRepository = new UserRepository();
