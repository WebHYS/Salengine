import { calculateConversion, calculatePerformanceScore } from '@/lib/metrics';

export function sumPeriodStats(
  shifts: Array<{
    date: Date;
    hoursWorked: number;
    conversations: number;
    salesCount: number;
    totalCost: number | null;
  }>,
  days: number
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const period = shifts.filter((s) => new Date(s.date) >= since);
  const hours = period.reduce((sum, s) => sum + s.hoursWorked, 0);
  const conversations = period.reduce((sum, s) => sum + s.conversations, 0);
  const sales = period.reduce((sum, s) => sum + s.salesCount, 0);
  const totalCost = period.reduce((sum, s) => sum + (s.totalCost ?? 0), 0);
  const conversion = calculateConversion(sales, conversations);
  const score = calculatePerformanceScore({ hoursWorked: hours, conversations, salesCount: sales, totalCost });

  return { hours, conversations, sales, totalCost, conversion, score };
}
