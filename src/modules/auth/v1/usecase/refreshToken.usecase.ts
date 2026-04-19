import { RefreshTokenDTO, AuthResponseDTO } from '../auth.dto';
import { UserRepository } from '@/modules/user/v1/user.repository';
import { AuthRepository } from '../auth.repository';
import { AuthService } from '../auth.service';
import { AppError } from '@/common/middleware/error.middleware';

export class RefreshTokenUseCase {
  constructor(
    private userRepository: UserRepository,
    private authRepository: AuthRepository,
    private authService: AuthService,
  ) { }

  async execute(data: RefreshTokenDTO): Promise<AuthResponseDTO> {
    // 1. Verify token signature
    let decoded;
    try {
      decoded = this.authService.verifyRefreshToken(data.refreshToken);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // 2. Check if token exists in DB and is not revoked
    const storedToken = await this.authRepository.findValidRefreshToken(data.refreshToken);
    if (!storedToken) {
      const error = new Error('Refresh token revoked or invalid') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // 3. Find user
    const user = await this.userRepository.findById(decoded.sub);
    if (!user) {
      const error = new Error('User not found') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // 4. Implement Token Rotation: Revoke old token
    await this.authRepository.revokeRefreshToken(data.refreshToken);

    // 5. Generate new tokens
    const payload = { sub: user.id, email: user.email };
    const newAccessToken = this.authService.generateAccessToken(payload);
    const newRefreshToken = this.authService.generateRefreshToken(payload);

    // 6. Save new refresh token
    await this.authRepository.createRefreshToken({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: this.authService.getRefreshTokenExpiry(),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }
}
