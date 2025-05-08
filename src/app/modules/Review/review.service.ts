import prisma from '../../../shared/prisma';
import { Review, ReviewStatus, UserRole } from '@prisma/client';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { reviewSearchableFields } from './review.constant';
import { queryBuilder } from '../../../shared/queryBuilder';
import { dataFetcher } from '../../../shared/dataFetcher';
import AppError from '../../errors/AppError';
import status from 'http-status';

const createReview = async (
  payload: {
    title: string;
    description: string;
    rating: number;
    purchaseSource?: string;
    images?: string[];
    categoryId: string;
    isPremium?: boolean;
    premiumPrice?: number;
    tags?: string[];
  },
  userId: string,
  userRole: string
): Promise<Review> => {
  await prisma.category.findUniqueOrThrow({
    where: {
      id: payload.categoryId,
    },
  });

  let authorData = {};

  if (userRole === UserRole.ADMIN) {
    const admin = await prisma.admin.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!admin) {
      throw new AppError(status.NOT_FOUND, 'Admin profile not found');
    }

    authorData = {
      adminId: admin.id,
      status: ReviewStatus.PUBLISHED,
    };
  } else {
    const regularUser = await prisma.regularUser.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!regularUser) {
      throw new AppError(status.NOT_FOUND, 'User profile not found');
    }

    authorData = {
      regularUserId: regularUser.id,
      status: ReviewStatus.PENDING,
    };
  }

  const tagsConnect = payload.tags
    ? {
        connect: payload.tags.map((tagId) => ({ id: tagId })),
      }
    : undefined;

  const result = await prisma.review.create({
    data: {
      title: payload.title,
      description: payload.description,
      rating: payload.rating,
      purchaseSource: payload.purchaseSource,
      images: payload.images || [],
      categoryId: payload.categoryId,
      isPremium: payload.isPremium || false,
      premiumPrice: payload.isPremium ? payload.premiumPrice : null,
      ...authorData,
      tags: tagsConnect,
    },
    include: {
      category: true,
      tags: true,
      admin: true,
      regularUser: true,
    },
  });

  return result;
};

const getAllReviews = async (
  filters: {
    searchTerm?: string;
    title?: string;
    categoryId?: string;
    rating?: number;
    status?: ReviewStatus;
    isPremium?: boolean;
    isFeatured?: boolean;
    regularUserId?: string;
    adminId?: string;
    isDeleted?: boolean;
  },
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const searchConditions = queryBuilder.buildSearchConditions(
    searchTerm,
    reviewSearchableFields
  );
  const filterConditions = queryBuilder.buildFilterConditions(filterData);
  const whereConditions = queryBuilder.buildWhereConditions([
    ...searchConditions,
    ...filterConditions,
  ]);

  const sortOrder = options.sortOrder;

  return dataFetcher.getPaginatedData(prisma.review, whereConditions, {
    page,
    limit,
    skip,
    sortBy: options.sortBy,
    sortOrder,
    include: {
      category: true,
      tags: true,
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          profilePhoto: true,
        },
      },
      regularUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          profilePhoto: true,
        },
      },
    },
  });
};

const getSingleReview = async (id: string): Promise<Review> => {
  // Increment view count
  const result = await prisma.review.update({
    where: {
      id,
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
    include: {
      category: true,
      tags: true,
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          profilePhoto: true,
        },
      },
      regularUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          fullName: true,
          profilePhoto: true,
        },
      },
      votes: {
        where: {
          isDeleted: false,
        },
        select: {
          id: true,
          type: true,
          userId: true,
        },
      },
      comments: {
        where: {
          isDeleted: false,
          parentId: null, // Only get top-level comments
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          replies: {
            where: {
              isDeleted: false,
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return result;
};

const updateReview = async (
  id: string,
  payload: Partial<
    Omit<
      Review,
      | 'tags'
      | 'category'
      | 'admin'
      | 'regularUser'
      | 'votes'
      | 'comments'
      | 'payments'
      | 'reports'
      | 'savedBy'
    >
  > & { tags?: string[] },
  userId: string,
  userRole: string
): Promise<Review> => {
  const existingReview = await prisma.review.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      admin: true,
      regularUser: true,
      tags: true,
    },
  });

  if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
    const regularUser = await prisma.regularUser.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!regularUser || existingReview.regularUserId !== regularUser.id) {
      throw new AppError(
        status.FORBIDDEN,
        'You do not have permission to update this review'
      );
    }

    if (
      existingReview.status !== ReviewStatus.PENDING &&
      existingReview.status !== ReviewStatus.PUBLISHED
    ) {
      throw new AppError(
        status.FORBIDDEN,
        'You cannot update this review in its current state'
      );
    }

    if (existingReview.status === ReviewStatus.PUBLISHED) {
      payload.status = ReviewStatus.PENDING;
    }
  }

  let tagsUpdate = {};
  if (payload.tags) {
    tagsUpdate = {
      tags: {
        set: [],
        connect: payload.tags.map((tagId) => ({ id: tagId })),
      },
    };
    delete payload.tags;
  }

  const cleanPayload: Record<string, any> = {};

  const allowedFields = [
    'title',
    'description',
    'rating',
    'purchaseSource',
    'images',
    'isFeatured',
    'isPremium',
    'premiumPrice',
    'moderationReason',
    'status',
  ];

  for (const field of allowedFields) {
    if (field in payload) {
      cleanPayload[field] = payload[field as keyof typeof payload];
    }
  }

  // Update the review
  const result = await prisma.review.update({
    where: {
      id,
    },
    data: {
      ...cleanPayload,
      ...tagsUpdate,
    },
    include: {
      category: true,
      tags: true,
      admin: true,
      regularUser: true,
    },
  });

  return result;
};

const deleteReview = async (
  id: string,
  userId: string,
  userRole: string
): Promise<Review> => {
  const existingReview = await prisma.review.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      admin: true,
      regularUser: true,
    },
  });

  if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
    const regularUser = await prisma.regularUser.findFirst({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!regularUser || existingReview.regularUserId !== regularUser.id) {
      throw new AppError(
        status.FORBIDDEN,
        'You do not have permission to delete this review'
      );
    }
  }

  const result = await prisma.review.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return result;
};

// Admin-specific operations
const moderateReview = async (
  id: string,
  payload: {
    status: ReviewStatus;
    moderationReason?: string;
    isFeatured?: boolean;
  },
  adminId: string
): Promise<Review> => {
  await prisma.review.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.review.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
      moderationReason: payload.moderationReason,
      isFeatured: payload.isFeatured,
    },
  });

  return result;
};

const saveReview = async (
  reviewId: string,
  userId: string
): Promise<Review> => {
  const existingReview = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
      status: ReviewStatus.PUBLISHED,
      isDeleted: false,
    },
  });

  const regularUser = await prisma.regularUser.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
  });

  if (!regularUser) {
    throw new AppError(status.NOT_FOUND, 'User profile not found');
  }

  await prisma.regularUser.update({
    where: {
      id: regularUser.id,
    },
    data: {
      savedReviews: {
        connect: {
          id: reviewId,
        },
      },
    },
  });

  return existingReview;
};

const unsaveReview = async (
  reviewId: string,
  userId: string
): Promise<Review> => {
  const existingReview = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
  });

  const regularUser = await prisma.regularUser.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
  });

  if (!regularUser) {
    throw new AppError(status.NOT_FOUND, 'User profile not found');
  }

  // Unsave the review for the user
  await prisma.regularUser.update({
    where: {
      id: regularUser.id,
    },
    data: {
      savedReviews: {
        disconnect: {
          id: reviewId,
        },
      },
    },
  });

  return existingReview;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  moderateReview,
  saveReview,
  unsaveReview,
};
