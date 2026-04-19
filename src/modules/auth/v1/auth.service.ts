import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '@/config/env';

export interface TokenPayload {
  sub: string;
  email: string;
}

export class AuthService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.auth.jwt.accessSecret, {
      expiresIn: config.auth.jwt.accessExpiry,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.auth.jwt.refreshSecret, {
      expiresIn: config.auth.jwt.refreshExpiry,
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.auth.jwt.accessSecret) as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.auth.jwt.refreshSecret) as TokenPayload;
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async decodeToken(jwtToken: string): Promise<any> {
    return jwt.decode(jwtToken);
  }

  getRefreshTokenExpiry(): Date {
    // Parse expiry string (e.g., '7d', '15m')
    const match = config.auth.jwt.refreshExpiry.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    const now = Date.now();
    switch (unit) {
      case 's':
        return new Date(now + value * 1000);
      case 'm':
        return new Date(now + value * 60 * 1000);
      case 'h':
        return new Date(now + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now + value * 24 * 60 * 60 * 1000);
      default:
        return new Date(now + 7 * 24 * 60 * 60 * 1000);
    }
  }

  async verifyKeycloakToken(token: string) {
    const publicKey = config.auth.keycloak.publicKey;
    return jwt.verify(token, publicKey, {
      issuer: config.auth.keycloak.authServerUrl + '/' + config.auth.keycloak.realm,
    });
  }
}

export const authService = new AuthService();
