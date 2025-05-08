import prisma from '../../../shared/prisma';
import { Category } from '@prisma/client';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { categorySearchableFields } from './category.constant';
import { queryBuilder } from '../../../shared/queryBuilder';
import { dataFetcher } from '../../../shared/dataFetcher';

const createCategory = async (payload: {
  name: string;
  icon?: string;
}): Promise<Category> => {
  const result = await prisma.category.create({
    data: payload,
  });

  return result;
};

const getAllCategories = async (
  filters: {
    searchTerm?: string;
    name?: string;
    isDeleted?: boolean;
  },
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const searchConditions = queryBuilder.buildSearchConditions(
    searchTerm,
    categorySearchableFields
  );
  const filterConditions = queryBuilder.buildFilterConditions(filterData);
  const whereConditions = queryBuilder.buildWhereConditions([
    ...searchConditions,
    ...filterConditions,
  ]);

  const sortOrder = options.sortOrder;

  return dataFetcher.getPaginatedData(prisma.category, whereConditions, {
    page,
    limit,
    skip,
    sortBy: options.sortBy,
    sortOrder,
  });
};

const getSingleCategory = async (id: string): Promise<Category> => {
  const result = await prisma.category.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return result;
};

const updateCategory = async (
  id: string,
  payload: Partial<Category>
): Promise<Category> => {
  const result = await prisma.category.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteCategory = async (id: string): Promise<Category> => {
  const result = await prisma.category.update({
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

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
