import { Request, Response } from 'express';
import { TagService } from './tag.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';
import pick from '../../../shared/pick';
import { paginationKeys } from '../../constants';
import { tagFilterableFields } from './tag.constant';

const createTag = catchAsync(async (req: Request, res: Response) => {
  const result = await TagService.createTag(req.body);
  
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Tag created successfully',
    data: result,
  });
});

const getAllTags = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, tagFilterableFields);
  const options = pick(req.query, paginationKeys);

  const result = await TagService.getAllTags(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Tags retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleTag = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TagService.getSingleTag(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Tag retrieved successfully',
    data: result,
  });
});

const updateTag = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TagService.updateTag(id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Tag updated successfully',
    data: result,
  });
});

const deleteTag = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TagService.deleteTag(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Tag deleted successfully',
    data: result,
  });
});

export const TagController = {
  createTag,
  getAllTags,
  getSingleTag,
  updateTag,
  deleteTag,
};
