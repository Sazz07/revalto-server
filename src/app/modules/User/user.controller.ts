import { UserService } from './user.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import status from 'http-status';

const createUser = catchAsync(async (req, res) => {
  const result = await UserService.createUser(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const result = await UserService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Admin created successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  createAdmin,
};
