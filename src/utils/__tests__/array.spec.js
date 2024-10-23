import { describe, it, expect } from 'vitest';
import { sortByKey, compareEquals } from '@/utils/array';

describe('Array Functions', () => {
  describe('sortByKey', () => {
    it('sorts array of objects by string key in ascending order', () => {
      const arr = [{ name: 'c' }, { name: 'a' }, { name: 'b' }];
      expect(sortByKey(arr, 'name')).toEqual([
        { name: 'a' },
        { name: 'b' },
        { name: 'c' },
      ]);
    });

    it('sorts array of objects by number key in ascending order', () => {
      const arr = [{ age: 30 }, { age: 20 }, { age: 25 }];
      expect(sortByKey(arr, 'age')).toEqual([
        { age: 20 },
        { age: 25 },
        { age: 30 },
      ]);
    });

    it('sorts array of objects in descending order', () => {
      const arr = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      expect(sortByKey(arr, 'name', 'desc')).toEqual([
        { name: 'c' },
        { name: 'b' },
        { name: 'a' },
      ]);
    });

    it('handles empty array', () => {
      expect(sortByKey([], 'key')).toEqual([]);
    });
  });

  describe('compareEquals', () => {
    it('returns true for equal arrays', () => {
      expect(compareEquals([1, 2, 3], [1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns false for unequal arrays', () => {
      expect(compareEquals([1, 2, 3], [1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('handles objects in arrays', () => {
      expect(compareEquals([{ a: 1 }], [{ a: 1 }])).toBe(true);
      expect(compareEquals([{ a: 1 }], [{ a: 2 }])).toBe(false);
    });

    it('handles empty arrays', () => {
      expect(compareEquals([], [], [])).toBe(true);
    });
  });
});
