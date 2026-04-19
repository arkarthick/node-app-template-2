import { UserRepository } from '@/modules/user/v1/user.repository';
import { AuditService } from '@/infrastructure/audit/audit.service';
import { AuthRepository } from '@/modules/auth/v1/auth.repository';
import { AuthService } from '@/modules/auth/v1/auth.service';
import { AuthResponseDTO } from '@/modules/auth/v1/auth.dto';
// In a real implementation, you would import an OIDC library like 'openid-client'
// and verify the token against the Keycloak server.

export class KeycloakLoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private authRepository: AuthRepository,
    private authService: AuthService,
    private auditService: AuditService,
  ) {}

  async execute(externalToken: string): Promise<AuthResponseDTO> {
    // 1. Verify externalToken with Keycloak
    // This is a placeholder for the actual OIDC verification logic
    const decodedToken = this.authService.verifyKeycloakToken(externalToken) as any;
    if (!decodedToken) {
      throw new Error('Invalid Keycloak token');
    }

    const keycloakData = {
      email: decodedToken.email,
      fullName: decodedToken.name || decodedToken.preferred_username,
      providerId: decodedToken.sub, // This is the unique ID from Keycloak
    };

    // 2. Find or Create User in our system
    let user = await this.userRepository.findByProvider('keycloak', keycloakData.providerId);

    if (!user) {
      // Check by email as well to link accounts
      user = await this.userRepository.findByEmail(keycloakData.email);
      if (user) {
        // Update user with provider info (Optional: based on project policy)
      } else {
        // Create new user
        user = await this.userRepository.create({
          email: keycloakData.email,
          fullName: keycloakData.fullName,
          // password remains null for SSO users
          provider: 'keycloak',
          providerId: keycloakData.providerId,
        } as any);
      }
    }

    if (!user) throw new Error('Failed to handle SSO user');

    // 3. Issue our own tokens
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.authService.generateAccessToken(payload);
    const refreshToken = this.authService.generateRefreshToken(payload);

    await this.authRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: this.authService.getRefreshTokenExpiry(),
    });

    await this.auditService.log({
      entityType: 'USER',
      entityId: user.id,
      action: 'LOGIN',
      metadata: { method: 'keycloak' },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}
