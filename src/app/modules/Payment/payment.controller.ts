import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';
import pick from '../../../shared/pick';
import { paginationKeys } from '../../constants';
import { paymentFilterableFields } from './payment.constant';
import { IAuthUser } from '../../interfaces/common';

const initPayment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { reviewId } = req.body;
    const result = await PaymentService.initPayment(reviewId, req.user!.id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Payment initiated successfully',
      data: result,
    });
  }
);

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.validatePayment(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Payment validated successfully',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, paymentFilterableFields);
  const options = pick(req.query, paginationKeys);

  const result = await PaymentService.getAllPayments(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Payments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PaymentService.getSinglePayment(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Payment retrieved successfully',
    data: result,
  });
});

const getUserPayments = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const options = pick(req.query, paginationKeys);
    const result = await PaymentService.getUserPayments(req.user!.id, options);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'User payments retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);

export const PaymentController = {
  initPayment,
  validatePayment,
  getAllPayments,
  getSinglePayment,
  getUserPayments,
};
