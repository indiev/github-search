import { jest } from "@jest/globals";

export type RateLimitInfo = {
  resource?: string;
  limit?: number | null;
  remaining?: number | null;
  used?: number | null;
  resetAt?: string | null;
  resetEpochSeconds?: number | null;
  retryAfterSeconds?: number | null;
  isLimited?: boolean;
  source?: string;
};

export const mockUseLazySearchUsersQuery: jest.Mock = jest.fn();
export const mockUseAppSelector: jest.Mock = jest.fn();
export const mockUseAppDispatch: jest.Mock = jest.fn();

export const useLazySearchUsersQuery = (): unknown =>
  mockUseLazySearchUsersQuery();
export const useAppSelector = (selector: unknown): unknown =>
  mockUseAppSelector(selector);
export const useAppDispatch = (): jest.Mock => mockUseAppDispatch;

export const retryCleared = () => ({ type: "rateLimit/retryCleared" });
export const retryCancelled = () => ({ type: "rateLimit/retryCancelled" });
export const selectRateLimit: jest.Mock = jest.fn();

export const rateLimitUpdated = (info: RateLimitInfo) => ({
  type: "rateLimit/rateLimitUpdated",
  payload: info,
});
