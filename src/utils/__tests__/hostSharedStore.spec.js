import { describe, it, expect, vi, beforeEach } from 'vitest';

const { safeImportMock, useSharedStoreMock } = vi.hoisted(() => ({
  safeImportMock: vi.fn(),
  useSharedStoreMock: vi.fn(),
}));

vi.mock('@/utils/moduleFederation', () => ({
  safeImport: safeImportMock,
}));

describe('hostSharedStore', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('captures the host store returned by useSharedStore', async () => {
    const store = {
      auth: { token: 'token' },
      current: { project: { uuid: 'project-1' } },
    };
    useSharedStoreMock.mockReturnValue(store);
    safeImportMock.mockResolvedValue({ useSharedStore: useSharedStoreMock });

    const { hostSharedStore } = await import('@/utils/hostSharedStore');

    expect(hostSharedStore).toBe(store);
  });

  it('returns undefined when useSharedStore is missing', async () => {
    safeImportMock.mockResolvedValue({});

    const { hostSharedStore } = await import('@/utils/hostSharedStore');

    expect(hostSharedStore).toBeUndefined();
  });

  it('returns undefined when useSharedStore throws', async () => {
    useSharedStoreMock.mockImplementation(() => {
      throw new Error('no active pinia');
    });
    safeImportMock.mockResolvedValue({ useSharedStore: useSharedStoreMock });

    const { hostSharedStore } = await import('@/utils/hostSharedStore');

    expect(hostSharedStore).toBeUndefined();
  });
});
