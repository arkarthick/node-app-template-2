import pinoHttp from 'pino-http';
import { logger } from '../../config/logger';

export const loggingMiddleware = pinoHttp({
  logger,
  genReqId: (req) => {
    return req.headers['x-request-id'] || req.id;
  },
  customLogLevel: function (_req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },
  customSuccessMessage: function (_req, res) {
    if (res.statusCode === 404) {
      return 'resource not found';
    }
    return `${_req.method} completed`;
  },
  customErrorMessage: function (_req, _res, _err) {
    return 'request erred';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
