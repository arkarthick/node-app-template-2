import { Router } from 'express';
import { UserController } from './user.controller';
import { userRepository } from './user.repository';
import { auditService } from '@/infrastructure/audit/audit.service';
import { CreateUserUseCase } from './usecase/createUser.usecase';
import { GetUserUseCase } from './usecase/getUser.usecase';
import { buildUserRoutes } from './user.routes';

export const buildUserModule = (): Router => {
  // UseCases
  const createUserUseCase = new CreateUserUseCase(userRepository, auditService);
  const getUserUseCase = new GetUserUseCase(userRepository);

  // Controller
  const userController = new UserController(createUserUseCase, getUserUseCase);

  // Routes
  return buildUserRoutes(userController);
};
