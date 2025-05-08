import prisma from '../../../shared/prisma';
import { Payment, PaymentStatus } from '@prisma/client';
import { SSLService } from '../SSL/ssl.service';
import AppError from '../../errors/AppError';
import status from 'http-status';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { paymentSearchableFields } from './payment.constant';
import { queryBuilder } from '../../../shared/queryBuilder';
import { dataFetcher } from '../../../shared/dataFetcher';

const initPayment = async (
  reviewId: string,
  userId: string
): Promise<{ paymentUrl: string }> => {
  const review = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    },
  });

  if (!review.isPremium) {
    throw new AppError(
      status.BAD_REQUEST,
      'This review is not premium content'
    );
  }

  if (!review.premiumPrice) {
    throw new AppError(
      status.BAD_REQUEST,
      'Premium price is not set for this review'
    );
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      reviewId,
      userId,
      status: PaymentStatus.PAID,
    },
  });

  if (existingPayment) {
    throw new AppError(
      status.BAD_REQUEST,
      'You have already purchased this premium review'
    );
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      regularUser: true,
    },
  });

  if (!user.regularUser) {
    throw new AppError(status.BAD_REQUEST, 'User profile not found');
  }

  const today = new Date();
  const transactionId = `REVALTO-${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}-${Math.floor(
    Math.random() * 1000
  )}`;

  const payment = await prisma.payment.create({
    data: {
      amount: review.premiumPrice,
      transactionId,
      status: PaymentStatus.UNPAID,
      userId,
      reviewId,
    },
  });

  const paymentData = {
    amount: payment.amount,
    transactionId: payment.transactionId,
    name: `${user.regularUser.firstName} ${user.regularUser.lastName}`,
    email: user.email,
    address: user.regularUser.address,
    contactNumber: user.regularUser.contactNumber,
    reviewId: review.id,
  };

  const result = await SSLService.initPayment(paymentData);

  return {
    paymentUrl: result.GatewayPageURL,
  };
};

const validatePayment = async (payload: any) => {
  if (!payload || !payload.status || payload.status !== 'VALID') {
    return {
      message: 'Invalid Payment!',
    };
  }

  const response = await SSLService.validatePayment(payload);

  if (response?.status !== 'VALID') {
    return {
      message: 'Payment Failed!',
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });
  });

  return {
    message: 'Payment successful!',
  };
};

const getAllPayments = async (
  filters: {
    searchTerm?: string;
    transactionId?: string;
    userId?: string;
    reviewId?: string;
    status?: PaymentStatus;
  },
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const searchConditions = queryBuilder.buildSearchConditions(
    searchTerm,
    paymentSearchableFields
  );
  const filterConditions = queryBuilder.buildFilterConditions(filterData);
  const whereConditions = queryBuilder.buildWhereConditions([
    ...searchConditions,
    ...filterConditions,
  ]);

  const sortOrder = options.sortOrder;

  return dataFetcher.getPaginatedData(prisma.payment, whereConditions, {
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

const getSinglePayment = async (id: string): Promise<Payment> => {
  const result = await prisma.payment.findUniqueOrThrow({
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

const getUserPayments = async (userId: string, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const whereConditions = {
    userId,
  };

  return dataFetcher.getPaginatedData(prisma.payment, whereConditions, {
    page,
    limit,
    skip,
    sortBy: options.sortBy || 'createdAt',
    sortOrder: options.sortOrder || 'desc',
    include: {
      review: true,
    },
  });
};

export const PaymentService = {
  initPayment,
  validatePayment,
  getAllPayments,
  getSinglePayment,
  getUserPayments,
};
