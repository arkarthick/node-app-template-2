import { Router } from 'express';
import { TesteController } from './testE.controller';
import { testeRepository } from './testE.repository';
import { TesteUseCase } from './usecase/testE.usecase';
import { buildTesteRoutes } from './testE.routes';

export const buildTesteModule = (): Router => {
  // UseCases
  const testeUseCase = new TesteUseCase(testeRepository);

  // Controller
  const testeController = new TesteController(testeUseCase);

  // Routes
  return buildTesteRoutes(testeController);
};
