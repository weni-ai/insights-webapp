import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeHtml,
  fullySanitize,
  validateInput,
} from '../sanatize';

describe('escapeHtml', () => {
  it('should return empty string for non-string input', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(123)).toBe('');
  });

  it('should remove HTML tags from string', () => {
    expect(escapeHtml('<p>Hello</p>')).toBe('Hello');
    expect(escapeHtml('<div>Test</div>')).toBe('Test');
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('should handle nested tags', () => {
    expect(escapeHtml('<div><p>Nested</p></div>')).toBe('Nested');
  });
});

describe('sanitizeHtml', () => {
  it('should return empty string for non-string input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml(123)).toBe('');
  });

  it('should respect maxLength parameter', () => {
    const longString = 'a'.repeat(2000);
    expect(sanitizeHtml(longString, [], 1000).length).toBe(1000);
  });

  it('should remove disallowed tags', () => {
    expect(sanitizeHtml('<p>Hello</p>', [])).toBe('Hello');
    expect(sanitizeHtml('<div>Test</div>', [])).toBe('Test');
  });
});

describe('fullySanitize', () => {
  it('should return empty string for non-string input', () => {
    expect(fullySanitize(null)).toBe('');
    expect(fullySanitize(undefined)).toBe('');
    expect(fullySanitize(123)).toBe('');
  });

  it('should remove all HTML tags even if allowed', () => {
    expect(fullySanitize('<p>Hello</p>', ['p'])).toBe('Hello');
    expect(fullySanitize('<div>Test</div>', ['div'])).toBe('Test');
  });

  it('should respect maxLength parameter', () => {
    const longString = 'a'.repeat(2000);
    expect(fullySanitize(longString, [], 1000).length).toBe(1000);
  });
});

describe('validateInput', () => {
  it('should return invalid for non-string input', () => {
    const result = validateInput(null);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Input must be a string.');
    expect(result.sanitized).toBe('');
  });

  it('should validate string length', () => {
    const longString = 'a'.repeat(2000);
    const result = validateInput(longString, [], 1000);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Input exceeds the maximum length of 1000 characters.',
    );
    expect(result.sanitized.length).toBe(1000);
  });

  it('should return valid for clean input', () => {
    const result = validateInput('Clean text');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitized).toBe('Clean text');
  });

  it('should detect and report HTML tag removal', () => {
    const result = validateInput('<p>Hello</p>');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Some HTML tags or attributes were removed for security reasons.',
    );
    expect(result.sanitized).toBe('Hello');
  });
});
