import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGpt } from '../gpt';
import { GPT } from '@/services/api';

vi.mock('@/services/api', () => ({
  GPT: {
    getInsights: vi.fn(),
  },
}));

describe('useGpt store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGpt();
  });

  it('should initialize with an empty insights array', () => {
    expect(store.insights).toEqual([]);
  });

  it('should call GPT.getInsights and push the result to insights', async () => {
    const mockPrompt = 'What is the future of AI?';
    const mockResponse = 'AI will continue to grow rapidly.';
    GPT.getInsights.mockResolvedValue(mockResponse);

    await store.getInsights({ prompt: mockPrompt });

    expect(GPT.getInsights).toHaveBeenCalledWith(mockPrompt);
    expect(store.insights).toEqual([
      { request: mockPrompt, received: mockResponse },
    ]);
  });

  it('should handle null or undefined responses from GPT.getInsights', async () => {
    const mockPrompt = 'Explain entropy.';
    GPT.getInsights.mockResolvedValue(null);

    await store.getInsights({ prompt: mockPrompt });

    expect(store.insights).toEqual([{ request: mockPrompt, received: '' }]);
  });
});
