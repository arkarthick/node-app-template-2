import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../../common/middleware/validation.middleware';
import { createUserSchema, getUserSchema } from './user.validation';

export const buildUserRoutes = (controller: UserController): Router => {
  const router = Router();

  router.post('/', validate(createUserSchema), controller.createUser);
  router.get('/:id', validate(getUserSchema), controller.getUser);

  return router;
};
