import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/infrastructure/database/drizzle/client';
import { refreshTokens, NewRefreshToken, users } from '@/infrastructure/database/drizzle/schema';

export class AuthRepository {
  async createRefreshToken(data: NewRefreshToken) {
    const [refreshToken] = await db.insert(refreshTokens).values(data).returning();
    return refreshToken;
  }

  async findValidRefreshToken(token: string) {
    const [refreshToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, token),
          gt(refreshTokens.expiresAt, new Date()),
          eq(refreshTokens.revokedAt, null as any),
        ),
      );
    return refreshToken;
  }

  async revokeRefreshToken(token: string) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token));
  }

  async revokeAllUserTokens(userId: string) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, userId));
  }

  async findByProviderId(provider: string, providerId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)));
    return user;
  }
}

export const authRepository = new AuthRepository();
