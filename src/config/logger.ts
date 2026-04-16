import pino, { LoggerOptions } from 'pino';
import { config } from '@/config/env';

const pinoOptions: LoggerOptions = {
  level: config.logLevel,
  ...(config.nodeEnv === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
};

export const logger = pino(pinoOptions);
