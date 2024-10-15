import { describe, it, expect, vi } from 'vitest';
import { parseJwt } from '@/utils/jwt';

describe('parseJwt', () => {
  it('parses JWT token correctly', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const parsed = parseJwt(token);
    expect(parsed).toEqual({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
  });

  it('handles invalid token', () => {
    expect(() => parseJwt('invalid.token')).toThrow();
  });
});
