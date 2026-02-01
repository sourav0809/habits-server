import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';

import pick from '../utils/pick';
import { response } from '../utils/response';

const validate = (schema: object) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const obj = pick(req, Object.keys(validSchema));
  const { error, value } = Joi.compile(validSchema)
    .prefs({ abortEarly: false, errors: { label: 'key' } })
    .validate(obj, { stripUnknown: true });
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return response(res, httpStatus.BAD_REQUEST, errorMessage);
  }
  Object.assign(req, value);
  return next();
};

export default validate;
