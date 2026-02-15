export function calculateConversion(sales: number, conversations: number) {
  if (conversations <= 0) return 0;
  return sales / conversations;
}

export function calculatePerformanceScore(input: {
  hoursWorked: number;
  conversations: number;
  salesCount: number;
  totalCost?: number | null;
}) {
  const conversion = calculateConversion(input.salesCount, input.conversations);
  const efficiency = input.hoursWorked > 0 ? input.salesCount / input.hoursWorked : 0;
  const costPenalty = input.totalCost ? input.totalCost / 100 : 0;

  const score = conversion * 50 + efficiency * 35 - costPenalty * 5 + input.salesCount * 2;
  return Number(score.toFixed(2));
}
