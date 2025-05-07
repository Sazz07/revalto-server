import { Response } from 'express';

type TMeta = {
  page: number;
  limit: number;
  total: number;
};

type TResponseData<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: TMeta | null;
  data?: T | null;
};

const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message || null,
    meta: data.meta || null || undefined,
    data: data.data || null || undefined,
  });
};

export default sendResponse;
