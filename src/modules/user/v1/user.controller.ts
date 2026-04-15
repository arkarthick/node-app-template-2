import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from './usecase/createUser.usecase';
import { GetUserUseCase } from './usecase/getUser.usecase';

export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserUseCase: GetUserUseCase,
  ) { }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.getUserUseCase.execute(req.params.id as string);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}
