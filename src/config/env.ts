import 'dotenv/config';
import Joi from 'joi';

const envSchema = Joi.object({
  APP_HOST: Joi.string().default('localhost'),
  APP_PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().required(),
  APP_BASE_PATH: Joi.string().required(),

  CORS_ORIGIN: Joi.string().required(),
  CORS_CREDENTIALS: Joi.boolean().required(),
  CORS_METHODS: Joi.string().required(),
  CORS_ALLOWED_HEADERS: Joi.string().required(),

  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('info'),

  DATABASE_URL: Joi.string().required(),
  DB_ORM: Joi.string().valid('prisma', 'drizzle').default('drizzle'),
  DB_PROVIDER: Joi.string().valid('postgresql', 'mysql').default('postgresql'),

  BULLMQ_REDIS_URL: Joi.string().optional(),
  RABBITMQ_URL: Joi.string().optional(),
  CAMUNDA_CLUSTER_ID: Joi.string().optional().empty(''),
  CAMUNDA_CLIENT_ID: Joi.string().optional().empty(''),
  CAMUNDA_CLIENT_SECRET: Joi.string().optional().empty(''),

  ENCRYPT: Joi.boolean().default(false),
  ENCRYPTION_KEY: Joi.string().when('ENCRYPT', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  CSRF_ENABLE: Joi.boolean().default(false),
  CSRF_SECRET: Joi.string().when('CSRF_ENABLE', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
})
  .unknown()
  .required();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  app: {
    host: envVars.APP_HOST,
    port: envVars.APP_PORT,
    name: envVars.APP_NAME,
    basePath: envVars.APP_BASE_PATH,
    encrypt: envVars.ENCRYPT,
    encryptionKey: envVars.ENCRYPTION_KEY,
    csrfEnable: envVars.CSRF_ENABLE,
    csrfSecret: envVars.CSRF_SECRET,
  },
  nodeEnv: envVars.NODE_ENV,
  logLevel: envVars.LOG_LEVEL,
  database: {
    url: envVars.DATABASE_URL,
    orm: envVars.DB_ORM,
    provider: envVars.DB_PROVIDER,
  },
  bullmq: {
    redisUrl: envVars.BULLMQ_REDIS_URL,
  },
  rabbitmq: {
    url: envVars.RABBITMQ_URL,
  },
  camunda: {
    clusterId: envVars.CAMUNDA_CLUSTER_ID,
    clientId: envVars.CAMUNDA_CLIENT_ID,
    clientSecret: envVars.CAMUNDA_CLIENT_SECRET,
  },
};
