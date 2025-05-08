import { Request } from 'express';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import { IFile } from '../../interfaces/file';
import { IPaginationOptions } from '../../interfaces/pagination';
import { userSearchableFields } from '../User/user.constant';
import { fileUploader } from '../../../helpers/fileUploader';
import * as bcrypt from 'bcrypt';
import config from '../../../config';
import { UserRole, UserStatus } from '@prisma/client';

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

const getAllUsers = async (filters: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: 'desc',
          },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleUser = async (id: string) => {
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  return result;
};

const updateUserStatus = async (
  id: string,
  payload: { status: UserStatus }
) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    if (user.role === UserRole.ADMIN && user.admin) {
      await transactionClient.admin.update({
        where: {
          id: user.admin.id,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } else if (user.role === UserRole.USER && user.regularUser) {
      await transactionClient.regularUser.update({
        where: {
          id: user.regularUser.id,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }

    const deletedUser = await transactionClient.user.update({
      where: {
        id,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedUser;
  });

  return result;
};

export const AdminService = {
  getAllUsers,
  createAdmin,
  getSingleUser,
  updateUserStatus,
  deleteUser,
};
