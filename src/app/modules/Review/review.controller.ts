import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';
import pick from '../../../shared/pick';
import { paginationKeys } from '../../constants';
import { reviewFilterableFields } from './review.constant';
import { IAuthUser } from '../../interfaces/common';
import { ReviewService } from './review.service';

const createReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await ReviewService.createReview(
      req.body,
      req.user!.id,
      req.user!.role
    );

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Review created successfully',
      data: result,
    });
  }
);

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, reviewFilterableFields);
  const options = pick(req.query, paginationKeys);

  const result = await ReviewService.getAllReviews(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.getSingleReview(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Review retrieved successfully',
    data: result,
  });
});

const updateReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.updateReview(
      id,
      req.body,
      req.user!.id,
      req.user!.role
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Review updated successfully',
      data: result,
    });
  }
);

const deleteReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.deleteReview(
      id,
      req.user!.id,
      req.user!.role
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Review deleted successfully',
      data: result,
    });
  }
);

const moderateReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.moderateReview(
      id,
      req.body,
      req.user!.id
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Review moderated successfully',
      data: result,
    });
  }
);

const saveReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.saveReview(id, req.user!.id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Review saved successfully',
      data: result,
    });
  }
);

const unsaveReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.unsaveReview(id, req.user!.id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Review unsaved successfully',
      data: result,
    });
  }
);

export const ReviewController = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  moderateReview,
  saveReview,
  unsaveReview,
};
