import { RegularUser, UserRole, UserStatus } from '@prisma/client';
import { Request } from 'express';
import { IFile } from '../../interfaces/file';
import { fileUploader } from '../../../helpers/fileUploader';
import * as bcrypt from 'bcrypt';
import config from '../../../config';
import prisma from '../../../shared/prisma';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { userSearchableFields } from './user.constant';

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
  const result = await prisma.user.findUnique({
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

const updateUser = async (id: string, payload: any) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  let result;

  if (user.role === UserRole.ADMIN && user.admin) {
    result = await prisma.admin.update({
      where: {
        id: user.admin.id,
      },
      data: payload,
    });
  } else if (user.role === UserRole.USER && user.regularUser) {
    result = await prisma.regularUser.update({
      where: {
        id: user.regularUser.id,
      },
      data: payload,
    });
  }

  return result;
};

const updateUserStatus = async (
  id: string,
  payload: { status: UserStatus }
) => {
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

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

const getMyProfile = async (user: any) => {
  const userData = await prisma.user.findUnique({
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
  createAdmin,
  getAllUsers,
  getSingleUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getMyProfile,
  updateMyProfile,
};
