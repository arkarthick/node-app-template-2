import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '@/common/middleware/validation.middleware';
import { loginSchema, refreshSchema, keycloakLoginSchema } from './auth.dto';

export const buildAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  /**
   * @swagger
   * /v1/auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Login with email and password
   */
  router.post('/login', validate(loginSchema), authController.login);

  /**
   * @swagger
   * /v1/auth/refresh:
   *   post:
   *     tags: [Auth]
   *     summary: Refresh access token
   */
  router.post('/refresh', validate(refreshSchema), authController.refreshToken);

  /**
   * @swagger
   * /v1/auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Logout user
   */
  router.post('/logout', authController.logout);

  /**
   * @swagger
   * /v1/auth/keycloak:
   *   post:
   *     tags: [Auth]
   *     summary: Login with Keycloak
   */
  router.post('/keycloak', validate(keycloakLoginSchema), authController.keycloakLogin);

  return router;
};
