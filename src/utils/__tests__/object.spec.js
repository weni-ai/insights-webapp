import { describe, it, expect } from 'vitest';
import {
  deepMerge,
  parseValue,
  stringifyValue,
  clearDeepValues,
  checkDeepEmptyValues,
  isObjectsEquals,
} from '@/utils/object.js';

describe('Object Utilities', () => {
  describe('deepMerge', () => {
    it('merges objects deeply', () => {
      const target = { a: { b: 1 }, c: 3 };
      const source = { a: { d: 2 }, e: 4 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: { b: 1, d: 2 }, c: 3, e: 4 });
    });

    it('handles null target', () => {
      const source = { a: 1 };
      const result = deepMerge(null, source);
      expect(result).toEqual(null);
    });

    it('handles non-object properties', () => {
      const target = { a: 1 };
      const source = { a: 2, b: { c: 3 } };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 2, b: { c: 3 } });
    });
  });

  describe('parseValue', () => {
    it('parses valid JSON', () => {
      expect(parseValue('{"a":1}')).toEqual({ a: 1 });
    });

    it('returns original value for invalid JSON', () => {
      expect(parseValue('invalid')).toBe('invalid');
    });

    it('handles numbers', () => {
      expect(parseValue('123')).toBe(123);
    });
  });

  describe('stringifyValue', () => {
    it('stringifies objects', () => {
      expect(stringifyValue({ a: 1 })).toBe('{"a":1}');
    });

    it('returns non-object values as-is', () => {
      expect(stringifyValue('test')).toBe('test');
      expect(stringifyValue(123)).toBe(123);
    });
  });

  describe('clearDeepValues', () => {
    it('clears values in nested objects', () => {
      const obj = { a: 1, b: { c: 'test', d: true }, e: [1, 2] };
      const result = clearDeepValues(obj);
      expect(result).toEqual({
        a: 0,
        b: { c: '', d: false },
        e: { 0: 0, 1: 0 },
      });
    });

    it('handles null input', () => {
      expect(clearDeepValues(null)).toBeNull();
    });

    it('handles empty object', () => {
      expect(clearDeepValues({})).toEqual({});
    });

    it('clears string values', () => {
      expect(clearDeepValues({ a: 'hello' })).toEqual({ a: '' });
    });

    it('clears number values', () => {
      expect(clearDeepValues({ a: 42 })).toEqual({ a: 0 });
    });

    it('clears boolean values', () => {
      expect(clearDeepValues({ a: true, b: false })).toEqual({
        a: false,
        b: false,
      });
    });

    it('preserves undefined values', () => {
      expect(clearDeepValues({ a: undefined })).toEqual({ a: undefined });
    });

    it('preserves null values', () => {
      expect(clearDeepValues({ a: null })).toEqual({ a: null });
    });
  });

  describe('checkDeepEmptyValues', () => {
    it('returns true for deeply empty object', () => {
      const obj = { a: '', b: { c: 0, d: false }, e: [0, ''] };
      expect(checkDeepEmptyValues(obj)).toBe(true);
    });

    it('returns false for non-empty object', () => {
      const obj = { a: '', b: { c: 1, d: false }, e: [0, ''] };
      expect(checkDeepEmptyValues(obj)).toBe(false);
    });

    it('handles null input', () => {
      expect(checkDeepEmptyValues(null)).toBe(true);
    });

    it('handles empty object', () => {
      expect(checkDeepEmptyValues({})).toBe(true);
    });
  });

  describe('isObjectsEquals', () => {
    it('returns true for equal objects', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      expect(isObjectsEquals(obj1, obj2)).toBe(true);
    });

    it('returns false for different objects', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };
      expect(isObjectsEquals(obj1, obj2)).toBe(false);
    });

    it('handles non-object values', () => {
      expect(isObjectsEquals('test', 'test')).toBe(true);
      expect(isObjectsEquals('test', 'different')).toBe(false);
    });
  });
});
