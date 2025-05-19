import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProject } from '../project';
import Projects from '@/services/api/resources/projects';
import { parseValue } from '@/utils/object';
import { flushPromises } from '@vue/test-utils';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    getProjectSource: vi.fn(),
  },
}));

vi.mock('@/utils/object', () => ({
  parseValue: vi.fn(),
}));

describe('useProject store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should set isCommerce value', () => {
    const store = useProject();
    store.setIsCommerce(true);
    expect(store.isCommerce).toBe(true);
  });

  it('should fetch and parse project flows', async () => {
    const store = useProject();

    const mockResponse = [
      {
        uuid: 'flow-1',
        name: 'Flow 1',
        metadata: '{}',
      },
    ];

    const parsedMetadata = {
      results: [{ key: 'result-1', name: 'Result 1' }],
    };

    Projects.getProjectSource.mockResolvedValue(mockResponse);
    parseValue.mockReturnValue(parsedMetadata);

    await store.getProjectFlows();

    expect(Projects.getProjectSource).toHaveBeenCalledWith('flows');
    expect(parseValue).toHaveBeenCalledWith('{}');
    expect(store.flows).toEqual([
      {
        value: 'flow-1',
        label: 'Flow 1',
        results: [{ value: 'result-1', label: 'Result 1' }],
      },
    ]);
    await flushPromises();
    expect(store.isLoadedFlows).toBe(true);
    expect(store.isLoadingFlows).toBe(false);
  });
});
