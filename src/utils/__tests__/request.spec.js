import { describe, it, expect } from 'vitest';
import { createRequestQuery } from '@/utils/request';

describe('createRequestQuery', () => {
  it('creates query object from flat params', () => {
    const params = { a: 1, b: 'test' };
    expect(createRequestQuery(params)).toEqual({ a: 1, b: 'test' });
  });

  it('handles nested params', () => {
    const params = { filter: { start: '2023-01-01', end: '2023-12-31' } };
    expect(createRequestQuery(params)).toEqual({
      filterstart: '2023-01-01',
      filterend: '2023-12-31',
    });
  });

  it('combines with initial params', () => {
    const params = { a: 1 };
    const initialParams = { b: 2 };
    expect(createRequestQuery(params, initialParams)).toEqual({ a: 1, b: 2 });
  });

  it('handles empty params', () => {
    expect(createRequestQuery({})).toEqual({});
  });

  it('handles array values', () => {
    const params = { ids: [1, 2, 3] };
    expect(createRequestQuery(params)).toEqual({ ids: [1, 2, 3] });
  });
});
