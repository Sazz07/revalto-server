import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import status from 'http-status';
import { TErrorSources, TGenericErrorResponse } from '../interfaces/error';

const handlePrismaClientKnownError = (
  err: PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let statusCode: number = status.BAD_REQUEST;
  let message = 'Database error';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: err.message,
    },
  ];

  // Handle unique constraint violations (P2002)
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[]) || [];
    statusCode = status.CONFLICT;
    message = 'Duplicate Field Value';
    errorSources = [
      {
        path: target.join(', '),
        message: `${target.join(', ')} already exists`,
      },
    ];
  }

  // Handle foreign key constraint failures (P2003)
  else if (err.code === 'P2003') {
    const field = (err.meta?.field_name as string) || '';
    statusCode = status.BAD_REQUEST;
    message = 'Foreign Key Constraint Failed';
    errorSources = [
      {
        path: field,
        message: `Related record not found for ${field}`,
      },
    ];
  }

  // Handle record not found (P2025)
  else if (err.code === 'P2025') {
    statusCode = status.NOT_FOUND;
    message = 'Record Not Found';
    errorSources = [
      {
        path: '',
        message: (err.meta?.cause as string) || 'Record not found',
      },
    ];
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaClientKnownError;
