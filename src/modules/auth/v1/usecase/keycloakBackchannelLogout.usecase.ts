import { AuthRepository } from '../auth.repository';
import { AuthService } from '../auth.service';
import { UserRepository } from '@/modules/user/v1/user.repository';
import { AuditService } from '@/infrastructure/audit/audit.service';
import { AppError } from '@/common/middleware/error.middleware';

export class KeycloakBackchannelLogoutUseCase {
  constructor(
    private userRepository: UserRepository,
    private authRepository: AuthRepository,
    private authService: AuthService,
    private auditService: AuditService,
  ) { }

  async execute(logoutToken: string): Promise<void> {
    try {
      // 1. Verify the logout token from Keycloak
      const decoded = await this.authService.verifyKeycloakToken(logoutToken) as any;

      if (!decoded || !decoded.sub) {
        const error = new Error('Invalid logout token') as AppError;
        error.statusCode = 400;
        throw error;
      }

      const keycloakId = decoded.sub;

      // 2. Find the user by their Keycloak ID (providerId)
      const user = await this.userRepository.findByProvider('keycloak', keycloakId);
      
      if (user) {
        // 3. Revoke all refresh tokens for this user
        await this.authRepository.revokeAllUserTokens(user.id);

        // 4. Log the audit event
        await this.auditService.log({
          entityType: 'USER',
          entityId: user.id,
          action: 'LOGOUT_SSO',
          metadata: { provider: 'keycloak', reason: 'backchannel_logout' },
        });
      }
    } catch (err) {
      // Log error but don't necessarily crash the webhook responder
      console.error('Keycloak Backchannel Logout error:', err);
      const error = new Error('Logout processing failed') as AppError;
      error.statusCode = 400;
      throw error;
    }
  }
}
