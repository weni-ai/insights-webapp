import { describe, it, expect } from 'vitest';

import { getPercentageOf, formatToPercent } from '../number';

describe('Numbers utils', () => {
  it('should percentage value from total value', () => {
    const value = 5;
    const total = 10;
    const valuePercentageOfTotal = getPercentageOf(value, total);
    expect(valuePercentageOfTotal).toBe('50');
  });
  it('should return formated percentage value', () => {
    const value = 25.25234;
    const formatedValue = formatToPercent(value);
    expect(formatedValue).toBe(`25.25%`);
  });
});
