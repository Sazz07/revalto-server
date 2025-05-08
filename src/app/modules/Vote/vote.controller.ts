import { Request, Response } from 'express';
import { VoteService } from './vote.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';
import pick from '../../../shared/pick';
import { paginationKeys } from '../../constants';
import { voteFilterableFields } from './vote.constant';
import { IAuthUser } from '../../interfaces/common';

const createVote = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await VoteService.createVote(req.body, req.user!.id);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: 'Vote created successfully',
      data: result,
    });
  }
);

const getAllVotes = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, voteFilterableFields);
  const options = pick(req.query, paginationKeys);

  const result = await VoteService.getAllVotes(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Votes retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleVote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VoteService.getSingleVote(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Vote retrieved successfully',
    data: result,
  });
});

const updateVote = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await VoteService.updateVote(id, req.body, req.user!.id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Vote updated successfully',
      data: result,
    });
  }
);

const deleteVote = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await VoteService.deleteVote(id, req.user!.id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Vote deleted successfully',
      data: result,
    });
  }
);

export const VoteController = {
  createVote,
  getAllVotes,
  getSingleVote,
  updateVote,
  deleteVote,
};
