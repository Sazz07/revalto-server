import prisma from '../../../shared/prisma';
import { Report, ReportStatus, UserRole } from '@prisma/client';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { reportSearchableFields } from './report.constant';
import { queryBuilder } from '../../../shared/queryBuilder';
import { dataFetcher } from '../../../shared/dataFetcher';
import AppError from '../../errors/AppError';
import status from 'http-status';

const createReport = async (
  payload: { reason: string; details?: string; reviewId: string },
  userId: string
): Promise<Report> => {
  await prisma.review.findUniqueOrThrow({
    where: {
      id: payload.reviewId,
    },
  });

  const existingReport = await prisma.report.findFirst({
    where: {
      reviewId: payload.reviewId,
      userId: userId,
    },
  });

  if (existingReport) {
    throw new AppError(
      status.BAD_REQUEST,
      'You have already reported this review'
    );
  }

  const result = await prisma.report.create({
    data: {
      reason: payload.reason,
      details: payload.details,
      reviewId: payload.reviewId,
      userId: userId,
    },
    include: {
      user: true,
      review: true,
    },
  });

  return result;
};

const getAllReports = async (
  filters: {
    searchTerm?: string;
    reason?: string;
    status?: ReportStatus;
    reviewId?: string;
    userId?: string;
  },
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const searchConditions = queryBuilder.buildSearchConditions(
    searchTerm,
    reportSearchableFields
  );
  const filterConditions = queryBuilder.buildFilterConditions(filterData);
  const whereConditions = queryBuilder.buildWhereConditions([
    ...searchConditions,
    ...filterConditions,
  ]);

  const sortOrder = options.sortOrder;

  return dataFetcher.getPaginatedData(prisma.report, whereConditions, {
    page,
    limit,
    skip,
    sortBy: options.sortBy,
    sortOrder,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      review: {
        select: {
          id: true,
          title: true,
          status: true,
          isPremium: true,
        },
      },
    },
  });
};

const getSingleReport = async (id: string): Promise<Report> => {
  const result = await prisma.report.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      user: true,
      review: {
        include: {
          category: true,
          tags: true,
          admin: true,
          regularUser: true,
        },
      },
    },
  });

  return result;
};

const updateReportStatus = async (
  id: string,
  payload: { status: ReportStatus },
  adminId: string
): Promise<Report> => {
  await prisma.report.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.report.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
    include: {
      user: true,
      review: true,
    },
  });

  return result;
};

export const ReportService = {
  createReport,
  getAllReports,
  getSingleReport,
  updateReportStatus,
};
