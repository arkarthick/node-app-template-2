import { users } from '@/infrastructure/database/drizzle/schema';

export type UserDTO = Omit<typeof users.$inferSelect, 'password'>;
export type CreateUserDTO = typeof users.$inferInsert;
