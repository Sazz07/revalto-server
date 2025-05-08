import { UserRole, UserStatus } from '@prisma/client';
import { Request } from 'express';
import { IFile } from '../../interfaces/file';
import { fileUploader } from '../../../helpers/fileUploader';
import * as bcrypt from 'bcrypt';
import config from '../../../config';
import prisma from '../../../shared/prisma';

const createUser = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.user.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_rounds)
  );

  const userData = {
    email: req.body.user.email,
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

const getMyProfile = async (user: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  return userData;
};

const updateMyProfile = async (user: any, payload: any) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  if (!userData) {
    throw new Error('User not found');
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
