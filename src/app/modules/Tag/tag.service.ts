import prisma from '../../../shared/prisma';
import { Tag } from '@prisma/client';
import { IPaginationOptions } from '../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { tagSearchableFields } from './tag.constant';
import { queryBuilder } from '../../../shared/queryBuilder';
import { dataFetcher } from '../../../shared/dataFetcher';

const createTag = async (payload: { name: string }): Promise<Tag> => {
  const result = await prisma.tag.create({
    data: payload,
  });

  return result;
};

const getAllTags = async (
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
    tagSearchableFields
  );
  const filterConditions = queryBuilder.buildFilterConditions(filterData);
  const whereConditions = queryBuilder.buildWhereConditions([
    ...searchConditions,
    ...filterConditions,
  ]);

  const sortOrder = options.sortOrder;

  return dataFetcher.getPaginatedData(prisma.tag, whereConditions, {
    page,
    limit,
    skip,
    sortBy: options.sortBy,
    sortOrder,
  });
};

const getSingleTag = async (id: string): Promise<Tag> => {
  const result = await prisma.tag.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return result;
};

const updateTag = async (
  id: string,
  payload: Partial<Tag>
): Promise<Tag> => {
  const result = await prisma.tag.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteTag = async (id: string): Promise<Tag> => {
  const result = await prisma.tag.update({
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

export const TagService = {
  createTag,
  getAllTags,
  getSingleTag,
  updateTag,
  deleteTag,
};
