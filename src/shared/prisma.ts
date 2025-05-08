import { PrismaClient } from '@prisma/client';
import { nameHelpers } from '../helpers/nameHelpers';

const prisma = new PrismaClient().$extends({
  query: {
    regularUser: {
      async create({ args, query }) {
        if (args.data) {
          args.data.fullName = nameHelpers.constructFullName(args.data);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data && nameHelpers.needsFullNameUpdate(args.data)) {
          const current = await prisma.regularUser.findUnique({
            where: args.where,
            select: { firstName: true, middleName: true, lastName: true },
          });

          if (current) {
            args.data.fullName = nameHelpers.constructFullNameWithCurrent(
              args.data,
              current
            );
          }
        }
        return query(args);
      },
    },
    admin: {
      async create({ args, query }) {
        if (args.data) {
          args.data.fullName = nameHelpers.constructFullName(args.data);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data && nameHelpers.needsFullNameUpdate(args.data)) {
          const current = await prisma.admin.findUnique({
            where: args.where,
            select: { firstName: true, middleName: true, lastName: true },
          });

          if (current) {
            args.data.fullName = nameHelpers.constructFullNameWithCurrent(
              args.data,
              current
            );
          }
        }
        return query(args);
      },
    },
  },
});

export default prisma;
