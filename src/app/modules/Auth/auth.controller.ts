import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { AuthService } from './auth.service';
import sendResponse from '../../../shared/sendResponse';
import status from 'http-status';
import config from '../../../config';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  const { refreshToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.env === 'production' ? true : false,
    httpOnly: true,
    sameSite: 'strict',
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Logged in successfully!',
    data: {
      accessToken: result.accessToken,
    },
  });
});

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req);
  const { refreshToken, userData } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.env === 'production' ? true : false,
    httpOnly: true,
    sameSite: 'strict',
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User created successfully!',
    data: userData,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Access token generated successfully!',
    data: result,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;

    const result = await AuthService.changePassword(user, req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Password changed successfully',
      data: result,
    });
  }
);

export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  registerUser,
};
