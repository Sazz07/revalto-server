import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { IFile } from '../../interfaces/file';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import * as bcrypt from 'bcrypt';
import config from '../../../config';
import prisma from '../../../shared/prisma';
import { IAuthUser } from '../../interfaces/common';

const createUser = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
    req.body.profilePhoto = uploadResult.secure_url;
  } else if (req.body.profilePhoto === 'null') {
    req.body.profilePhoto = null;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_rounds)
  );

  const userData = {
    email: req.body.email,
    password: hashedPassword,
    role: UserRole.USER,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdUser = await transactionClient.regularUser.create({
      data: req.body.user,
    });
    return createdUser;
  });

  return result;
};

const getMyProfile = async (user: IAuthUser) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      regularUser: true,
    },
  });

  return userData;
};

const updateMyProfile = async (req: Request & { user?: IAuthUser }) => {
  const file = req.file as IFile;
  const payload = req.body;

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: req.user?.email,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  // Handle profile photo update
  if (file) {
    const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
    payload.profilePhoto = uploadResult.secure_url;

    // Delete old profile photo from Cloudinary if it exists
    if (userData.role === UserRole.ADMIN && userData.admin?.profilePhoto) {
      try {
        const publicId = userData.admin.profilePhoto
          .split('/')
          .pop()
          ?.split('.')[0];
        if (publicId) {
          await FileUploadHelper.deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting old profile photo:', error);
      }
    } else if (
      userData.role === UserRole.USER &&
      userData.regularUser?.profilePhoto
    ) {
      try {
        const publicId = userData.regularUser.profilePhoto
          .split('/')
          .pop()
          ?.split('.')[0];
        if (publicId) {
          await FileUploadHelper.deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting old profile photo:', error);
      }
    }
  } else if (payload.profilePhoto === 'null') {
    payload.profilePhoto = null;
  }

  let result;

  if (userData.role === UserRole.ADMIN && userData.admin) {
    result = await prisma.admin.update({
      where: {
        id: userData.admin.id,
      },
      data: payload,
    });
  } else if (userData.role === UserRole.USER && userData.regularUser) {
    result = await prisma.regularUser.update({
      where: {
        id: userData.regularUser.id,
      },
      data: payload,
    });
  }

  return result;
};

export const UserService = {
  createUser,
  getMyProfile,
  updateMyProfile,
};
