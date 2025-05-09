import { NextFunction, Request, Response } from 'express';
import config from '../../config';
import { Secret } from 'jsonwebtoken';
import status from 'http-status';
import AppError from '../errors/AppError';
import { jwtHelpers } from '../../helpers/jwtHelpers';

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(status.UNAUTHORIZED, 'You are not authorized!');
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new AppError(status.UNAUTHORIZED, 'Invalid token format');
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.jwt_secret as Secret
      );

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(status.FORBIDDEN, 'Forbidden!');
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
