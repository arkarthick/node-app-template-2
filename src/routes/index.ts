import { Router } from 'express';
import { buildUserModule } from '../modules/user/v1/user.module';

export const buildRoutes = (): Router => {
  const router = Router();

  // Version 1 Routes
  router.use('/v1/users', buildUserModule());

  // Future Versions
  // router.use('/v2/users', buildUserV2Module());

  return router;
};
