import { ApiResponse } from '../utils/api-response';
import { ResponseCode } from '../constants/response-codes';
import { NextFunction, Request, Response } from 'express';
import { Schema } from 'joi';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      { abortEarly: false, stripUnknown: true, allowUnknown: true },
    );

    if (error) {
      const details = error.details.map((d) => ({
        message: d.message,
        path: d.path,
      }));
      return ApiResponse.error(res, {
        message: 'Validation failed',
        statusCode: 400,
        code: ResponseCode.VALIDATION_ERROR,
        data: details,
      });
    }

    // Replace req data with validated data (stripped of unknown fields)
    req.body = value.body;
    req.query = value.query;
    req.params = value.params;

    next();
  };
};
