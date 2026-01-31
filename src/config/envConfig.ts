import * as dotenv from 'dotenv';
import Joi from 'joi';

import { SERVER_ENVIRONMENT } from '../constant';

dotenv.config();

const requiredForEnv = (schema: Joi.Schema<any>): Joi.Schema =>
  schema.when('SERVER_ENV', {
    is: Joi.valid(SERVER_ENVIRONMENT.TEST, SERVER_ENVIRONMENT.PRODUCTION),
    then: Joi.required()
  });

const envVarsSchema = Joi.object()
  .keys({
    // auth 
    BCRYPT_SALT_ROUNDS: Joi.string().optional(),
    MASTER_PASSWORD: Joi.string().required(),

    // database
    DATABASE_URL: requiredForEnv(Joi.string().required()),
    PORT: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),

    // server
    SERVER_ENV: Joi.string()
      .valid(SERVER_ENVIRONMENT.DEVELOPMENT, SERVER_ENVIRONMENT.TEST, SERVER_ENVIRONMENT.PRODUCTION)
      .required()
  })
  .unknown();

const { error, value: envVars } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error && process.env.SERVER_ENV !== SERVER_ENVIRONMENT.DEVELOPMENT) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envConfig = {
  databaseUrl: envVars.DATABASE_URL,
  security: {
    bcryptSaltRounds: envVars.BCRYPT_SALT_ROUNDS || '12',
    masterPassword: envVars.MASTER_PASSWORD,
    secretKey: envVars.JWT_SECRET
  },
  server: {
    env: envVars.SERVER_ENV,
    port: envVars.PORT
  }
};

export default envConfig;