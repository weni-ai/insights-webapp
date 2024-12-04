import { describe, it, expect } from 'vitest';

import { getPercentageOf } from '../number';

describe('Numbers utils', () => {
  it('should percentage value from total value', () => {
    const value = 5;
    const total = 10;
    const valuePercentageOfTotal = getPercentageOf(value, total);
    expect(valuePercentageOfTotal).toBe('50');
  });
});
