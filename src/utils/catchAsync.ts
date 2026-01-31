import { RequestHandler } from 'express';
import { NextFunction, Request, Response } from 'express-serve-static-core';

import Logger from '../config/logger';

export interface CustomParamsDictionary {
  [key: string]: any;
}

const catchAsync =
  (fn: RequestHandler<CustomParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>) =>
    (
      req: Request,
      res: Response<any, Record<string, any>, number>,
      next: NextFunction
    ) => {
      Promise.resolve(fn(req, res, next)).catch((err) => {
        Logger.log('error', {
          err: err,
          message: err?.message || 'Internal Server Error',
          req: req
        });
        next(err);
      });
    };

export default catchAsync;