import { queryBuilder } from './queryBuilder';

export const dataFetcher = {
  getPaginatedData: async (
    model: any,
    whereConditions: any,
    options: {
      page: number;
      limit: number;
      skip: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      include?: Record<string, boolean | object>;
    }
  ) => {
    const { page, limit, skip, include } = options;

    const orderBy = queryBuilder.buildOrderByConditions(options);

    const result = await model.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy,
      include,
    });

    const total = await model.count({
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
  },
};
