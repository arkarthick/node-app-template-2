import { AuthRepository } from '../auth.repository';

export class LogoutUseCase {
  constructor(private authRepository: AuthRepository) { }

  async execute(refreshToken: string): Promise<void> {
    await this.authRepository.revokeRefreshToken(refreshToken);
  }
}
