import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from './usecase/login.usecase';
import { RefreshTokenUseCase } from './usecase/refreshToken.usecase';
import { LogoutUseCase } from './usecase/logout.usecase';
import { KeycloakLoginUseCase } from './usecase/keycloakLogin.usecase';
import { ApiResponse } from '@/common/utils/api-response';
import { config } from '@/config/env';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUseCase: LogoutUseCase,
    private keycloakLoginUseCase: KeycloakLoginUseCase,
  ) { }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      this.sendTokenResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await this.refreshTokenUseCase.execute({ refreshToken });
      this.sendTokenResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await this.logoutUseCase.execute(refreshToken);
      }
      res.clearCookie('refreshToken');
      return ApiResponse.success(res, { data: null, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  keycloakLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const result = await this.keycloakLoginUseCase.execute(token);
      this.sendTokenResponse(res, result, 'SSO Login successful');
    } catch (error) {
      next(error);
    }
  };

  private sendTokenResponse(res: Response, result: any, message: string) {
    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (match REFRESH_TOKEN_EXPIRY)
    });

    return ApiResponse.success(res, {
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
      },
      message,
    });
  }
}
