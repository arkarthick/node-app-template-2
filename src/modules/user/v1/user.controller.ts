import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from './usecase/createUser.usecase';
import { GetUserUseCase } from './usecase/getUser.usecase';
import { ApiResponse } from '../../../common/utils/api-response';
import { ResponseCode } from '../../../common/constants/response-codes';

export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserUseCase: GetUserUseCase,
  ) { }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      return ApiResponse.success(res, {
        data: user,
        message: 'User created successfully',
        statusCode: 201,
        code: ResponseCode.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.getUserUseCase.execute(req.params.id as string);
      return ApiResponse.success(res, {
        data: user,
        message: 'User retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
