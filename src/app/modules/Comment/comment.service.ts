import prisma from '../../../shared/prisma';
import { Comment, UserRole } from '@prisma/client';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { commentSearchableFields } from './comment.constant';
import { queryBuilder } from '../../../shared/queryBuilder';
import { dataFetcher } from '../../../shared/dataFetcher';
import AppError from '../../errors/AppError';
import status from 'http-status';

const createComment = async (
  payload: { content: string; reviewId: string; parentId?: string },
  userId: string
): Promise<Comment> => {
  await prisma.review.findUniqueOrThrow({
    where: {
      id: payload.reviewId,
    },
  });

  if (payload.parentId) {
    const parentComment = await prisma.comment.findUniqueOrThrow({
      where: {
        id: payload.parentId,
      },
    });

    if (parentComment.reviewId !== payload.reviewId) {
      throw new AppError(
        status.BAD_REQUEST,
        'Parent comment must belong to the same review'
      );
    }
  }

  const result = await prisma.comment.create({
    data: {
      content: payload.content,
      reviewId: payload.reviewId,
      userId: userId,
      parentId: payload.parentId,
    },
    include: {
      user: true,
      review: true,
      parent: true,
      replies: true,
    },
  });

  return result;
};

const getAllComments = async (
  filters: {
    searchTerm?: string;
    reviewId?: string;
    userId?: string;
    parentId?: string;
    isDeleted?: boolean;
  },
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const searchConditions = queryBuilder.buildSearchConditions(
    searchTerm,
    commentSearchableFields
  );
  const filterConditions = queryBuilder.buildFilterConditions(filterData);
  const whereConditions = queryBuilder.buildWhereConditions([
    ...searchConditions,
    ...filterConditions,
  ]);

  const sortOrder = options.sortOrder;

  return dataFetcher.getPaginatedData(prisma.comment, whereConditions, {
    page,
    limit,
    skip,
    sortBy: options.sortBy,
    sortOrder,
    include: {
      user: true,
      review: true,
      parent: true,
      replies: true,
    },
  });
};

const getSingleComment = async (id: string): Promise<Comment> => {
  const result = await prisma.comment.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      user: true,
      review: true,
      parent: true,
      replies: true,
    },
  });

  return result;
};

const updateComment = async (
  id: string,
  payload: Partial<Comment>,
  userId: string,
  userRole: string
): Promise<Comment> => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (
    comment.userId !== userId &&
    userRole !== UserRole.ADMIN &&
    userRole !== UserRole.SUPER_ADMIN
  ) {
    throw new AppError(
      status.FORBIDDEN,
      'You can only update your own comments'
    );
  }

  const result = await prisma.comment.update({
    where: {
      id,
    },
    data: payload,
    include: {
      user: true,
      review: true,
      parent: true,
      replies: true,
    },
  });

  return result;
};

const deleteComment = async (
  id: string,
  userId: string,
  userRole: string
): Promise<Comment> => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (
    comment.userId !== userId &&
    userRole !== UserRole.ADMIN &&
    userRole !== UserRole.SUPER_ADMIN
  ) {
    throw new AppError(
      status.FORBIDDEN,
      'You can only delete your own comments'
    );
  }

  const result = await prisma.comment.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
    include: {
      user: true,
      review: true,
      parent: true,
      replies: true,
    },
  });

  return result;
};

export const CommentService = {
  createComment,
  getAllComments,
  getSingleComment,
  updateComment,
  deleteComment,
};
