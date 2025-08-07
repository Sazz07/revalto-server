import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AnyZodObject } from 'zod';

type FileUploadOptions = {
  fieldName: string;
  maxCount?: number;
  parseData?: boolean;
  validationSchema?: AnyZodObject;
};

// Use NODE_ENV to determine upload directory
const isProduction = process.env.NODE_ENV === 'production';
const uploadsDir = isProduction
  ? '/tmp/uploads'
  : path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Configure multer with file type filtering
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'));
  },
});

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
        ? upload.single(fieldName)
        : upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }

      if (parseData && req.body?.data) {
        try {
          const parsedData = JSON.parse(req.body.data);

          if (validationSchema) {
            const validatedData = validationSchema.parse({
              body: parsedData,
            });
            req.body = validatedData.body;
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
