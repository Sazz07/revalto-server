import { UserRole, Review } from '@prisma/client';

export type IAuthUser = {
  id: string;
  email: string;
  role: UserRole;
} | null;

export interface IReviewWithPremiumStatus extends Review {
  isPremiumLocked?: boolean;
}
