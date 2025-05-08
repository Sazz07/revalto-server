export const queryBuilder = {
  buildSearchConditions: (
    searchTerm: string | undefined,
    searchableFields: string[]
  ) => {
    if (!searchTerm) return [];

    return [
      {
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        })),
      },
    ];
  },

  buildFilterConditions: (filterData: Record<string, any>) => {
    if (Object.keys(filterData).length === 0) return [];

    return [
      {
        AND: Object.keys(filterData).map((key) => ({
          [key]: {
            equals: filterData[key],
          },
        })),
      },
    ];
  },

  buildWhereConditions: (conditions: any[]) => {
    return conditions.length > 0 ? { AND: conditions } : {};
  },

  buildOrderByConditions: (options: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: 'desc' };
  },
};
