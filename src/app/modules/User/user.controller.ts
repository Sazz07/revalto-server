import { Request, Response } from 'express';
import { UserService } from './user.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';
import pick from '../../../shared/pick';
import { userFilterableFields } from './user.constant';
import { paginationKeys } from '../../constants';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Admin created successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, paginationKeys);

  const result = await UserService.getAllUsers(filters, options);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Users retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getSingleUser(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateUser(id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.updateUserStatus(id, req.body);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User status updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User deleted successfully',
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
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserService.updateMyProfile(req.user, req.body);

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
  createAdmin,
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getMyProfile,
  updateMyProfile,
};
