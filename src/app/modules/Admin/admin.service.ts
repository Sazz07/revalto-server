import { Request } from 'express';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import { IFile } from '../../interfaces/file';
import { IPaginationOptions } from '../../interfaces/pagination';
import { userSearchableFields } from '../User/user.constant';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import * as bcrypt from 'bcrypt';
import config from '../../../config';
import { UserRole, UserStatus } from '@prisma/client';
import { queryBuilder } from '../../../shared/queryBuilder';
import { dataFetcher } from '../../../shared/dataFetcher';

const createAdmin = async (req: Request) => {
  const file = req.file as IFile;

  if (file) {
    const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadResult.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.bcrypt_salt_rounds)
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

const getAllUsers = async (
  filters: {
    searchTerm?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
  },
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const searchConditions = queryBuilder.buildSearchConditions(
    searchTerm,
    userSearchableFields
  );
  const filterConditions = queryBuilder.buildFilterConditions(filterData);
  const whereConditions = queryBuilder.buildWhereConditions([
    ...searchConditions,
    ...filterConditions,
  ]);

  const sortOrder = options.sortOrder;

  return dataFetcher.getPaginatedData(prisma.user, whereConditions, {
    page,
    limit,
    skip,
    sortBy: options.sortBy,
    sortOrder,
    include: {
      admin: true,
      regularUser: true,
    },
  });
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
