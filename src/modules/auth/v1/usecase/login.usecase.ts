import { UserRepository } from '@/modules/user/v1/user.repository';
import { AppError } from '@/common/middleware/error.middleware';
import { AuditService } from '@/infrastructure/audit/audit.service';
import { AuthRepository } from '@/modules/auth/v1/auth.repository';
import { AuthService } from '@/modules/auth/v1/auth.service';
import { AuthResponseDTO, LoginDTO } from '@/modules/auth/v1/auth.dto';

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private authRepository: AuthRepository,
    private authService: AuthService,
    private auditService: AuditService,
  ) {}

  async execute(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user || !user.password) {
      const error = new Error('Invalid email or password') as AppError;
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await this.authService.comparePasswords(data.password!, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password') as AppError;
      error.statusCode = 401;
      throw error;
    }

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
      metadata: { method: 'local' },
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
