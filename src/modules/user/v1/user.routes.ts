import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../../common/middleware/validation.middleware';
import { createUserSchema, getUserSchema } from './user.validation';

export const buildUserRoutes = (controller: UserController): Router => {
  const router = Router();

  // SWAGGER
  /**
   * @swagger
   * /v1/users:
   *   post:
   *     summary: Create a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUser'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   */
  router.post('/', validate(createUserSchema), controller.createUser);

  /**
   * @swagger
   * /v1/users/{id}:
   *   get:
   *     summary: Get a user by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: User found successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   */
  router.get('/:id', validate(getUserSchema), controller.getUser);

  return router;
};
