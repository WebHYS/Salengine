import { describe, expect, it } from 'vitest';
import { calculateConversion, calculatePerformanceScore } from '../lib/metrics';

describe('calculateConversion', () => {
  it('returns 0 when conversations are zero', () => {
    expect(calculateConversion(5, 0)).toBe(0);
  });

  it('computes conversion ratio correctly', () => {
    expect(calculateConversion(8, 40)).toBe(0.2);
  });
});

describe('calculatePerformanceScore', () => {
  it('calculates weighted score with cost penalty', () => {
    expect(
      calculatePerformanceScore({
        hoursWorked: 20,
        conversations: 100,
        salesCount: 15,
        totalCost: 50
      })
    ).toBe(60);
  });

  it('handles zero hours and no cost', () => {
    expect(
      calculatePerformanceScore({
        hoursWorked: 0,
        conversations: 0,
        salesCount: 0,
        totalCost: null
      })
    ).toBe(0);
  });
});
