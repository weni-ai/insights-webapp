import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import hotjarPlugin from '@/utils/plugins/Hotjar';
import env from '@/utils/env';

vi.mock('@/utils/env', () => ({
  default: vi.fn(),
}));

describe('Hotjar Plugin', () => {
  let headAppendChildSpy;
  let originalWindow;

  beforeEach(() => {
    originalWindow = global.window;
    global.window = { hj: vi.fn() };
    global.document = {
      getElementsByTagName: vi.fn(() => [{ appendChild: vi.fn() }]),
      createElement: vi.fn(() => ({ async: false })),
    };

    headAppendChildSpy = vi.spyOn(
      global.document.getElementsByTagName('head')[0],
      'appendChild',
    );
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  it('should not initialize Hotjar if HOTJAR_ID is not set', () => {
    env.mockReturnValue(null);

    hotjarPlugin();

    expect(window.hj).not.toHaveBeenCalled();
    expect(headAppendChildSpy).not.toHaveBeenCalled();
  });

  it('should set the user email if provided', () => {
    env.mockReturnValue('123456');
    const userEmail = 'test@example.com';

    hotjarPlugin(userEmail);

    expect(window.hj).toHaveBeenCalledWith('identify', userEmail, {});
  });

  it('should not set the user email if not provided', () => {
    env.mockReturnValue('123456');

    hotjarPlugin();

    expect(window.hj).not.toHaveBeenCalledWith(
      'identify',
      expect.anything(),
      {},
    );
  });

  it('should set hj as a queue function if it is undefined', () => {
    env.mockReturnValue('123456');
    delete global.window.hj;

    hotjarPlugin();

    expect(window.hj).toBeDefined();
    expect(window.hj).toBeInstanceOf(Function);
    expect(window.hj.q).toBeInstanceOf(Array);
  });

  it('should not reinitialize hj if it already exists', () => {
    env.mockReturnValue('123456');
    window.hj = vi.fn();

    hotjarPlugin();

    expect(window.hj).not.toHaveBeenCalledWith(expect.any(Function));
  });
});
