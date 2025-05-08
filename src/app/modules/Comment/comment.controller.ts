import { Request, Response } from 'express';
import { CommentService } from './comment.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';
import pick from '../../../shared/pick';
import { paginationKeys } from '../../constants';
import { commentFilterableFields } from './comment.constant';
import { IAuthUser } from '../../interfaces/common';

const createComment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await CommentService.createComment(req.body, req.user!.id);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Comment created successfully',
      data: result,
    });
  }
);

const getAllComments = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, commentFilterableFields);
  const options = pick(req.query, paginationKeys);

  const result = await CommentService.getAllComments(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Comments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CommentService.getSingleComment(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Comment retrieved successfully',
    data: result,
  });
});

const updateComment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await CommentService.updateComment(
      id,
      req.body,
      req.user!.id,
      req.user!.role
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Comment updated successfully',
      data: result,
    });
  }
);

const deleteComment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await CommentService.deleteComment(
      id,
      req.user!.id,
      req.user!.role
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Comment deleted successfully',
      data: result,
    });
  }
);

export const CommentController = {
  createComment,
  getAllComments,
  getSingleComment,
  updateComment,
  deleteComment,
};