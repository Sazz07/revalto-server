import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

import handleZodError from '../errors/handleZodError';
import handlePrismaClientKnownError from '../errors/handlePrismaClientKnownError';
import handlePrismaValidationError from '../errors/handlePrismaValidationError';
import AppError from '../errors/AppError';

import config from '../../config';
import { TErrorSources } from '../interfaces/error';
import status from 'http-status';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  // ZodError handling
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  // Prisma known request errors (P2002, P2003, P2025, etc.)
  else if (err instanceof PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  // Prisma validation errors
  else if (err instanceof PrismaClientValidationError) {
    const simplifiedError = handlePrismaValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  // Custom AppError
  else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }
  // Generic Error
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    error: errorSources,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
