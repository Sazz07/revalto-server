import prisma from '../../../shared/prisma';
import { PaymentStatus, Vote, VoteType } from '@prisma/client';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { voteSearchableFields } from './vote.constant';
import { queryBuilder } from '../../../shared/queryBuilder';
import { dataFetcher } from '../../../shared/dataFetcher';
import AppError from '../../errors/AppError';
import status from 'http-status';

const createVote = async (
  payload: { type: VoteType; reviewId: string },
  userId: string
): Promise<Vote> => {
  const review = await prisma.review.findUniqueOrThrow({
    where: {
      id: payload.reviewId,
    },
  });

  if (review.isPremium) {
    const hasAccess = await prisma.payment.findFirst({
      where: {
        reviewId: payload.reviewId,
        userId: userId,
        status: PaymentStatus.PAID,
      },
    });

    if (!hasAccess) {
      throw new AppError(
        status.FORBIDDEN,
        'You need to purchase this premium review to vote on it'
      );
    }
  }

  const existingVote = await prisma.vote.findUnique({
    where: {
      reviewId_userId: {
        reviewId: payload.reviewId,
        userId: userId,
      },
    },
  });

  if (existingVote && !existingVote.isDeleted) {
    throw new AppError(
      status.BAD_REQUEST,
      'You have already voted on this review'
    );
  }

  if (existingVote && existingVote.isDeleted) {
    const result = await prisma.$transaction(async (transactionClient) => {
      const updatedVote = await transactionClient.vote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          type: payload.type,
          isDeleted: false,
          deletedAt: null,
        },
      });

      await updateReviewHelpfulnessCount(transactionClient, payload.reviewId);

      return updatedVote;
    });

    return result;
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const createdVote = await transactionClient.vote.create({
      data: {
        type: payload.type,
        reviewId: payload.reviewId,
        userId: userId,
      },
    });

    await updateReviewHelpfulnessCount(transactionClient, payload.reviewId);

    return createdVote;
  });

  return result;
};

const getAllVotes = async (
  filters: {
    searchTerm?: string;
    type?: VoteType;
    reviewId?: string;
    userId?: string;
    isDeleted?: boolean;
  },
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const searchConditions = queryBuilder.buildSearchConditions(
    searchTerm,
    voteSearchableFields
  );
  const filterConditions = queryBuilder.buildFilterConditions(filterData);
  const whereConditions = queryBuilder.buildWhereConditions([
    ...searchConditions,
    ...filterConditions,
  ]);

  const sortOrder = options.sortOrder;

  return dataFetcher.getPaginatedData(prisma.vote, whereConditions, {
    page,
    limit,
    skip,
    sortBy: options.sortBy,
    sortOrder,
    include: {
      user: true,
      review: true,
    },
  });
};

const getSingleVote = async (id: string): Promise<Vote> => {
  const result = await prisma.vote.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      user: true,
      review: true,
    },
  });

  return result;
};

const updateVote = async (
  id: string,
  payload: Partial<Vote>,
  userId: string
): Promise<Vote> => {
  const vote = await prisma.vote.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (vote.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You can only update your own votes');
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedVote = await transactionClient.vote.update({
      where: {
        id,
      },
      data: payload,
    });

    await updateReviewHelpfulnessCount(transactionClient, vote.reviewId);

    return updatedVote;
  });

  return result;
};

const deleteVote = async (id: string, userId: string): Promise<Vote> => {
  const vote = await prisma.vote.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (vote.userId !== userId) {
    throw new AppError(status.FORBIDDEN, 'You can only delete your own votes');
  }

  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedVote = await transactionClient.vote.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await updateReviewHelpfulnessCount(transactionClient, vote.reviewId);

    return deletedVote;
  });

  return result;
};

const updateReviewHelpfulnessCount = async (
  transactionClient: any,
  reviewId: string
) => {
  const upvoteCount = await transactionClient.vote.count({
    where: {
      reviewId,
      type: VoteType.UPVOTE,
      isDeleted: false,
    },
  });

  const downvoteCount = await transactionClient.vote.count({
    where: {
      reviewId,
      type: VoteType.DOWNVOTE,
      isDeleted: false,
    },
  });

  await transactionClient.review.update({
    where: {
      id: reviewId,
    },
    data: {
      helpfulCount: upvoteCount,
      unhelpfulCount: downvoteCount,
    },
  });
};

export const VoteService = {
  createVote,
  getAllVotes,
  getSingleVote,
  updateVote,
  deleteVote,
};
