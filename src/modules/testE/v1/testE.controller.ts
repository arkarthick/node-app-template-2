import { Request, Response, NextFunction } from 'express';
import { TesteUseCase } from './usecase/testE.usecase';
import { ApiResponse } from '@/common/utils/api-response';
import { ResponseCode } from '@/common/constants/response-codes';

export class TesteController {
  constructor(private testeUseCase: TesteUseCase) {}

  exampleMethod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.testeUseCase.execute(req.body);
      return ApiResponse.success(res, {
        data: result,
        message: 'Teste processed successfully',
        statusCode: 200,
        code: ResponseCode.SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  };
}
