import { RegularUser, UserRole } from '@prisma/client';
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
    config.bcrypt_salt_rounds as string
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

const createAdmin = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    config.bcrypt_salt_rounds as string
  );

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdUser = await transactionClient.admin.create({
      data: req.body.admin,
    });
    return createdUser;
  });

  return result;
};

export const UserService = {
  createUser,
  createAdmin,
};
