import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { IFile } from '../../interfaces/file';
import { fileUploader } from '../../../helpers/fileUploader';
import * as bcrypt from 'bcrypt';
import config from '../../../config';
import prisma from '../../../shared/prisma';
import { IAuthUser } from '../../interfaces/common';

const createUser = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = uploadToCloudinary?.secure_url;
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

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    payload.profilePhoto = uploadToCloudinary?.secure_url;
  } else if (payload.profilePhoto === 'null') {
    payload.profilePhoto = null;
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: req.user?.email,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

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
