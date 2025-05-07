import { Request, Response } from 'express';
import status from 'http-status';

const notFound = (req: Request, res: Response) => {
  res.status(status.NOT_FOUND).json({
    success: false,
    statusCode: status.NOT_FOUND,
    message: 'API NOT FOUND!',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
};

export default notFound;
