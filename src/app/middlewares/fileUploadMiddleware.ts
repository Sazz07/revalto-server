import { NextFunction, Request, Response } from 'express';
import { fileUploader } from '../../helpers/fileUploader';
import { AnyZodObject } from 'zod';

type FileUploadOptions = {
  fieldName: string;
  maxCount?: number;
  parseData?: boolean;
  validationSchema?: AnyZodObject;
};

/**
 * Creates a middleware for handling file uploads with optional JSON data parsing
 * @param options Configuration options for file upload
 * @returns Express middleware function
 */
export const createFileUploadMiddleware = (options: FileUploadOptions) => {
  const {
    fieldName,
    maxCount = 1,
    parseData = true,
    validationSchema,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware =
      maxCount === 1
        ? fileUploader.upload.single(fieldName)
        : fileUploader.upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }

      if (parseData && req.body?.data) {
        try {
          const parsedData = JSON.parse(req.body.data);

          if (validationSchema) {
            req.body = validationSchema.parse(parsedData);
          } else {
            req.body = parsedData;
          }
        } catch (error) {
          return next(error);
        }
      }

      next();
    });
  };
};
