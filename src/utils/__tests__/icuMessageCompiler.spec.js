import { describe, it, expect, vi } from 'vitest';

import {
  shouldUseIntlMessageFormat,
  icuMessageCompiler,
} from '../icuMessageCompiler';

describe('icuMessageCompiler', () => {
  describe('shouldUseIntlMessageFormat', () => {
    it('returns true for plural ICU messages', () => {
      expect(
        shouldUseIntlMessageFormat(
          '{count, plural, one {# item} other {# items}}',
        ),
      ).toBe(true);
    });

    it('returns true for selectordinal ICU messages', () => {
      expect(
        shouldUseIntlMessageFormat(
          '{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
        ),
      ).toBe(true);
    });

    it('returns true for select ICU messages', () => {
      expect(
        shouldUseIntlMessageFormat(
          '{gender, select, male {he} female {she} other {they}}',
        ),
      ).toBe(true);
    });

    it('returns false for plain messages and false positives', () => {
      expect(shouldUseIntlMessageFormat('Hello {name}')).toBe(false);
      expect(shouldUseIntlMessageFormat('{user, select another option}')).toBe(
        false,
      );
      expect(shouldUseIntlMessageFormat('{item, plural forms available}')).toBe(
        false,
      );
    });
  });

  describe('icuMessageCompiler', () => {
    it('formats plural ICU messages', () => {
      const compiled = icuMessageCompiler(
        '{count, plural, one {# item} other {# items}}',
        { locale: 'en', key: 'items', onError: vi.fn() },
      );

      expect(compiled({ values: { count: 1 } })).toBe('1 item');
      expect(compiled({ values: { count: 5 } })).toBe('5 items');
    });

    it('formats named placeholders for plain strings', () => {
      const compiled = icuMessageCompiler('Hello {name}!', {
        locale: 'en',
        key: 'greeting',
        onError: vi.fn(),
      });

      expect(compiled({ values: { name: 'Weni' } })).toBe('Hello Weni!');
      expect(compiled({ values: {} })).toBe('Hello {name}!');
      expect(compiled({ values: { name: null } })).toBe('Hello !');
      expect(compiled({})).toBe('Hello {name}!');
    });

    it('applies default HTML tag handlers for ICU markup', () => {
      const compiled = icuMessageCompiler(
        '{count, plural, one {<b>#</b> item<br/>} other {<b>#</b> items<br/>}}',
        { locale: 'en', key: 'items_html', onError: vi.fn() },
      );

      expect(compiled({ values: { count: 1 } })).toBe('<b>1</b> item<br/>');
    });

    it('keeps custom tag handlers when provided', () => {
      const compiled = icuMessageCompiler(
        '{count, plural, one {<b>#</b>} other {<b>#</b>}}',
        { locale: 'en', key: 'bold', onError: vi.fn() },
      );

      const result = compiled({
        values: {
          count: 2,
          b: (chunks) => `*${chunks.join('')}*`,
        },
      });

      expect(result).toBe('*2*');
    });

    it('calls onError and returns key for non-string AST messages', () => {
      const onError = vi.fn();
      const compiled = icuMessageCompiler(
        { type: 'ast' },
        {
          locale: 'en',
          key: 'fallback.key',
          onError,
        },
      );

      expect(compiled()).toBe('fallback.key');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
