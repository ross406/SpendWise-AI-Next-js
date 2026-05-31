import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns UTC start and end dates for a given month and year.
 * Safe to use with MongoDB queries regardless of server timezone.
 *
 * @param month - 1-indexed month (1 = January, 12 = December)
 * @param year  - Full year (e.g. 2025)
 *
 * @example
 * const { startDate, endDate } = getMonthDateRange(5, 2025);
 * // startDate → 2025-05-01T00:00:00.000Z
 * // endDate   → 2025-06-01T00:00:00.000Z
 */
export function getMonthDateRange(month: number, year: number) {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1)); // first of next month

  return { startDate, endDate };
}
