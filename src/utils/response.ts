import { Response } from 'express';
import httpStatus from 'http-status';

const response = (res: Response, statusCode: number, message: string, data = {} as any) => {
  return res.status(statusCode).json({
    data,
    message
  });
};

const internalServerError = (res: Response, message: string) => {
  return response(res, httpStatus.INTERNAL_SERVER_ERROR, message);
};

export { internalServerError, response };