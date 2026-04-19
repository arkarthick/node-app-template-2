import { Router } from 'express';
import { AuthController } from './auth.controller';
import { LoginUseCase } from './usecase/login.usecase';
import { RefreshTokenUseCase } from './usecase/refreshToken.usecase';
import { LogoutUseCase } from './usecase/logout.usecase';
import { KeycloakLoginUseCase } from './usecase/keycloakLogin.usecase';
import { userRepository } from '@/modules/user/v1/user.repository';
import { authRepository } from './auth.repository';
import { authService } from './auth.service';
import { auditService } from '@/infrastructure/audit/audit.service';
import { buildAuthRoutes } from './auth.routes';

export const buildAuthModule = (): Router => {
  // Dependency Injection
  const loginUseCase = new LoginUseCase(userRepository, authRepository, authService, auditService);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, authRepository, authService);
  const logoutUseCase = new LogoutUseCase(authRepository);
  const keycloakLoginUseCase = new KeycloakLoginUseCase(
    userRepository,
    authRepository,
    authService,
    auditService,
  );

  const authController = new AuthController(
    loginUseCase,
    refreshTokenUseCase,
    logoutUseCase,
    keycloakLoginUseCase,
  );

  return buildAuthRoutes(authController);
};
