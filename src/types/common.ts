import type { Request } from "express";
import type { IUser } from "@/models/user.model";
import Joi from "joi";

export interface JoiValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

/** Request with authenticated user (set by auth middleware). */
export interface AuthenticatedRequest extends Request {
  user: IUser;
}
