import { Request, Response } from 'express';
import { UserService } from './user.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';
import { IAuthUser } from '../../interfaces/common';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserService.getMyProfile(req.user);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Profile retrieved successfully',
      data: result,
    });
  }
);

const updateMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await UserService.updateMyProfile(req);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

export const UserController = {
  createUser,
  getMyProfile,
  updateMyProfile,
};
