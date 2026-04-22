import { Router } from 'express';
import { TesteController } from './testE.controller';
import { validate } from '@/common/middleware/validation.middleware';
import { createTesteSchema } from './testE.validation';

export const buildTesteRoutes = (controller: TesteController): Router => {
  const router = Router();

  /**
   * @swagger
   * /v1/testEs:
   *   post:
   *     tags: [Teste]
   *     summary: Create a new testE
   *     responses:
   *       200:
   *         description: Success
   */
  router.post('/', validate(createTesteSchema), controller.exampleMethod);

  return router;
};
