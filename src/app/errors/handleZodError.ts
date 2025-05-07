import { ZodError, ZodIssue } from 'zod';
import status from 'http-status';
import { TErrorSources, TGenericErrorResponse } from '../interfaces/error';

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  return {
    statusCode: status.BAD_REQUEST,
    message: 'Validation Error!',
    errorSources,
  };
};

export default handleZodError;
