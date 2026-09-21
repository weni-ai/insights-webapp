import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const captureException = vi.fn();
const defineAsyncComponent = vi.fn((loader) => ({ __loader: loader }));

vi.mock('@sentry/browser', () => ({
  captureException: (...args) => captureException(...args),
}));

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    defineAsyncComponent: (...args) => defineAsyncComponent(...args),
  };
});

vi.mock('../env', () => ({
  default: vi.fn(),
}));

describe('moduleFederation', () => {
  let env;

  beforeEach(async () => {
    vi.resetModules();
    captureException.mockClear();
    defineAsyncComponent.mockClear();

    env = (await import('../env')).default;
    env.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isFederatedModule', () => {
    it('should be false when origin matches PUBLIC_PATH_URL', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? window.location.origin : undefined,
      );

      const { isFederatedModule } = await import('../moduleFederation.js');
      expect(isFederatedModule).toBe(false);
    });

    it('should be true when origin differs from PUBLIC_PATH_URL', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? 'https://remote.example.com' : undefined,
      );

      const { isFederatedModule } = await import('../moduleFederation.js');
      expect(isFederatedModule).toBe(true);
    });
  });

  describe('safeAsyncComponent', () => {
    it('should return empty object when not federated', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? window.location.origin : undefined,
      );

      const { safeAsyncComponent } = await import('../moduleFederation.js');
      const importFn = vi.fn();

      expect(safeAsyncComponent(importFn)).toEqual({});
      expect(defineAsyncComponent).not.toHaveBeenCalled();
      expect(importFn).not.toHaveBeenCalled();
    });

    it('should wrap successful import with defineAsyncComponent when federated', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? 'https://remote.example.com' : undefined,
      );

      const { safeAsyncComponent } = await import('../moduleFederation.js');
      const component = { name: 'Remote' };
      const importFn = vi.fn().mockResolvedValue(component);

      const result = safeAsyncComponent(importFn);
      expect(defineAsyncComponent).toHaveBeenCalledTimes(1);
      expect(result.__loader).toBeDefined();

      const loaded = await result.__loader();
      expect(loaded).toBe(component);
    });

    it('should capture exception when federated import fails', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? 'https://remote.example.com' : undefined,
      );

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { safeAsyncComponent } = await import('../moduleFederation.js');
      const error = new Error('load failed');
      const importFn = vi.fn().mockRejectedValue(error);

      const result = safeAsyncComponent(importFn);
      await result.__loader();

      expect(consoleError).toHaveBeenCalled();
      expect(captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: {
            module_federation: true,
            error_type: 'component_load_failed',
          },
        }),
      );

      consoleError.mockRestore();
    });
  });

  describe('safeImport', () => {
    it('should return empty object when not federated', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? window.location.origin : undefined,
      );

      const { safeImport } = await import('../moduleFederation.js');
      const importFn = vi.fn();

      await expect(safeImport(importFn, 'remote/locales')).resolves.toEqual({});
      expect(importFn).not.toHaveBeenCalled();
    });

    it('should return module.default when present', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? 'https://remote.example.com' : undefined,
      );

      const { safeImport } = await import('../moduleFederation.js');
      const importFn = vi
        .fn()
        .mockResolvedValue({ default: { hello: 'world' } });

      await expect(safeImport(importFn, 'remote/locales')).resolves.toEqual({
        hello: 'world',
      });
    });

    it('should return module itself when default is missing', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? 'https://remote.example.com' : undefined,
      );

      const { safeImport } = await import('../moduleFederation.js');
      const module = { hello: 'world' };
      const importFn = vi.fn().mockResolvedValue(module);

      await expect(safeImport(importFn, 'remote/locales')).resolves.toBe(
        module,
      );
    });

    it('should report to Sentry and return empty object on failure', async () => {
      env.mockImplementation((key) =>
        key === 'PUBLIC_PATH_URL' ? 'https://remote.example.com' : undefined,
      );

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { safeImport } = await import('../moduleFederation.js');
      const error = new Error('unavailable');
      const importFn = vi.fn().mockRejectedValue(error);

      await expect(safeImport(importFn, 'remote/locales')).resolves.toEqual({});
      expect(captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: { module_federation: true, import_path: 'remote/locales' },
        }),
      );

      consoleError.mockRestore();
    });
  });
});
