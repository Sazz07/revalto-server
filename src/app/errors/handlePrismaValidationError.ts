import { PrismaClientValidationError } from '@prisma/client/runtime/library';

import status from 'http-status';
import { TErrorSources, TGenericErrorResponse } from '../interfaces/error';

const handlePrismaValidationError = (
  err: PrismaClientValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorSources = [
    {
      path: '',
      message: err.message.split('\n').pop() || 'Validation Error',
    },
  ];

  return {
    statusCode: status.BAD_REQUEST,
    message: 'Validation Error',
    errorSources,
  };
};

export default handlePrismaValidationError;
