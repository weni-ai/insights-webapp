import { describe, it, expect, vi } from 'vitest';
import { pxToVh } from '@/utils/css';

describe('pxToVh', () => {
  it('converts px to vh correctly', () => {
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);
    expect(pxToVh(100)).toBe(10);
  });

  it('handles zero px', () => {
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);
    expect(pxToVh(0)).toBe(0);
  });
});
