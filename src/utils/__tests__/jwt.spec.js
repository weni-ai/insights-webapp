import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseJwt } from '@/utils/jwt';
import { getJwtToken } from '@/utils/jwt';
import { moduleStorage } from '@/utils/storage';

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

describe('getJwtToken', () => {
  beforeEach(() => {
    window.self = window.top;
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('resolves immediately when not in iframe', async () => {
    const result = await getJwtToken();
    expect(result).toBeUndefined();
  });

  it('sets up message listener and sends message when in iframe', async () => {
    // Mock iframe environment
    window.self = {};
    window.top = {};

    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const promise = getJwtToken();

    expect(postMessageSpy).toHaveBeenCalledWith({ event: 'getToken' }, '*');
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );

    // Simulate token update event to resolve the promise
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          event: 'updateToken',
          token: 'test.token',
        },
      }),
    );

    // Clean up
    window.self = window.top;
    await promise;
  });

  it('handles token update event and stores in moduleStorage', async () => {
    window.self = {};
    window.top = {};

    const testToken = 'test.jwt.token';
    const promise = getJwtToken();

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          event: 'updateToken',
          token: testToken,
        },
      }),
    );

    await promise;
    expect(moduleStorage.getItem('token')).toBe(testToken);

    window.self = window.top;
  });
});
