import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAutoWidgets } from '../autoWidgets';

const mockGetAgentInvocationData = vi.fn();
const mockGetToolResultData = vi.fn();
const mockSetHasEndpointData = vi.fn();

vi.mock('@/services/api/resources/conversational/widgets', () => ({
  default: {
    getAgentInvocationData: (...args: unknown[]) =>
      mockGetAgentInvocationData(...args),
    getToolResultData: (...args: unknown[]) => mockGetToolResultData(...args),
  },
}));

vi.mock('../conversational', () => ({
  useConversational: () => ({
    setHasEndpointData: mockSetHasEndpointData,
  }),
}));

describe('useAutoWidgets store', () => {
  let store: ReturnType<typeof useAutoWidgets>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAutoWidgets();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null data and no loading/error', () => {
      expect(store.agentInvocation).toEqual({
        data: null,
        isLoading: false,
        error: false,
      });
      expect(store.toolResult).toEqual({
        data: null,
        isLoading: false,
        error: false,
      });
    });

    it('should return false for hasAgentInvocationData initially', () => {
      expect(store.hasAgentInvocationData).toBe(false);
    });

    it('should return false for hasToolResultData initially', () => {
      expect(store.hasToolResultData).toBe(false);
    });
  });

  describe('loadAgentInvocationData', () => {
    it('should store data when API returns results', async () => {
      const mockResponse = {
        results: [
          {
            label: 'agent_a',
            agent: { uuid: '111' },
            value: 60,
            full_value: 60,
          },
        ],
      };
      mockGetAgentInvocationData.mockResolvedValue(mockResponse);

      await store.loadAgentInvocationData();

      expect(store.agentInvocation.data).toEqual(mockResponse);
      expect(store.agentInvocation.isLoading).toBe(false);
      expect(store.agentInvocation.error).toBe(false);
    });

    it('should call setHasEndpointData(true) when results are not empty', async () => {
      mockGetAgentInvocationData.mockResolvedValue({
        results: [
          {
            label: 'a',
            agent: { uuid: '1' },
            value: 10,
            full_value: 10,
          },
        ],
      });

      await store.loadAgentInvocationData();

      expect(mockSetHasEndpointData).toHaveBeenCalledWith(true);
    });

    it('should not call setHasEndpointData when results are empty', async () => {
      mockGetAgentInvocationData.mockResolvedValue({ results: [] });

      await store.loadAgentInvocationData();

      expect(mockSetHasEndpointData).not.toHaveBeenCalled();
    });

    it('should set error on failure', async () => {
      mockGetAgentInvocationData.mockRejectedValue(new Error('Network error'));

      await store.loadAgentInvocationData();

      expect(store.agentInvocation.error).toBe(true);
      expect(store.agentInvocation.isLoading).toBe(false);
    });

    it('should abort previous request when called again', async () => {
      let secondResolve: (value: unknown) => void;

      mockGetAgentInvocationData
        .mockImplementationOnce(
          (_params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            secondResolve = resolve;
          }),
        );

      const first = store.loadAgentInvocationData();
      const second = store.loadAgentInvocationData();

      expect(mockGetAgentInvocationData).toHaveBeenCalledTimes(2);

      const firstSignal = mockGetAgentInvocationData.mock.calls[0][1]?.signal;
      expect(firstSignal?.aborted).toBe(true);

      secondResolve!({ results: [] });
      await second;
      await first;

      expect(store.agentInvocation.data).toEqual({ results: [] });
      expect(store.agentInvocation.isLoading).toBe(false);
      expect(store.agentInvocation.error).toBe(false);
    });

    it('should not set error or update loading when aborted', async () => {
      mockGetAgentInvocationData
        .mockImplementationOnce(
          (_params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockResolvedValueOnce({ results: [] });

      const first = store.loadAgentInvocationData();
      const second = store.loadAgentInvocationData();

      await second;
      await first;

      expect(store.agentInvocation.error).toBe(false);
      expect(store.agentInvocation.isLoading).toBe(false);
    });

    it('should pass signal to service call', async () => {
      mockGetAgentInvocationData.mockResolvedValue({ results: [] });

      await store.loadAgentInvocationData();

      expect(mockGetAgentInvocationData).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  describe('loadToolResultData', () => {
    it('should store data when API returns results', async () => {
      const mockResponse = {
        results: [
          {
            label: 'tool_a',
            agent: { uuid: '222' },
            value: 45,
            full_value: 45,
          },
        ],
      };
      mockGetToolResultData.mockResolvedValue(mockResponse);

      await store.loadToolResultData();

      expect(store.toolResult.data).toEqual(mockResponse);
      expect(store.toolResult.isLoading).toBe(false);
      expect(store.toolResult.error).toBe(false);
    });

    it('should call setHasEndpointData(true) when results are not empty', async () => {
      mockGetToolResultData.mockResolvedValue({
        results: [
          {
            label: 't',
            agent: { uuid: '1' },
            value: 5,
            full_value: 5,
          },
        ],
      });

      await store.loadToolResultData();

      expect(mockSetHasEndpointData).toHaveBeenCalledWith(true);
    });

    it('should not call setHasEndpointData when results are empty', async () => {
      mockGetToolResultData.mockResolvedValue({ results: [] });

      await store.loadToolResultData();

      expect(mockSetHasEndpointData).not.toHaveBeenCalled();
    });

    it('should set error on failure', async () => {
      mockGetToolResultData.mockRejectedValue(new Error('Network error'));

      await store.loadToolResultData();

      expect(store.toolResult.error).toBe(true);
      expect(store.toolResult.isLoading).toBe(false);
    });

    it('should abort previous request when called again', async () => {
      let secondResolve: (value: unknown) => void;

      mockGetToolResultData
        .mockImplementationOnce(
          (_params: unknown, opts: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              opts.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        )
        .mockReturnValueOnce(
          new Promise((resolve) => {
            secondResolve = resolve;
          }),
        );

      const first = store.loadToolResultData();
      const second = store.loadToolResultData();

      expect(mockGetToolResultData).toHaveBeenCalledTimes(2);

      const firstSignal = mockGetToolResultData.mock.calls[0][1]?.signal;
      expect(firstSignal?.aborted).toBe(true);

      secondResolve!({ results: [] });
      await second;
      await first;

      expect(store.toolResult.data).toEqual({ results: [] });
      expect(store.toolResult.isLoading).toBe(false);
      expect(store.toolResult.error).toBe(false);
    });

    it('should pass signal to service call', async () => {
      mockGetToolResultData.mockResolvedValue({ results: [] });

      await store.loadToolResultData();

      expect(mockGetToolResultData).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      );
    });
  });

  describe('loadAllAutoWidgets', () => {
    it('should load both widgets in parallel', async () => {
      mockGetAgentInvocationData.mockResolvedValue({ results: [] });
      mockGetToolResultData.mockResolvedValue({ results: [] });

      await store.loadAllAutoWidgets();

      expect(mockGetAgentInvocationData).toHaveBeenCalledTimes(1);
      expect(mockGetToolResultData).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetAutoWidgets', () => {
    it('should reset all state to initial values', async () => {
      mockGetAgentInvocationData.mockResolvedValue({
        results: [
          {
            label: 'a',
            agent: { uuid: '1' },
            value: 10,
            full_value: 10,
          },
        ],
      });
      await store.loadAgentInvocationData();

      store.resetAutoWidgets();

      expect(store.agentInvocation).toEqual({
        data: null,
        isLoading: false,
        error: false,
      });
      expect(store.toolResult).toEqual({
        data: null,
        isLoading: false,
        error: false,
      });
    });

    it('should abort in-flight requests', async () => {
      mockGetAgentInvocationData.mockImplementation(
        (_params: unknown, opts: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            opts.signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      );
      mockGetToolResultData.mockImplementation(
        (_params: unknown, opts: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            opts.signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      );

      const agentPromise = store.loadAgentInvocationData();
      const toolPromise = store.loadToolResultData();

      const agentSignal = mockGetAgentInvocationData.mock.calls[0][1]?.signal;
      const toolSignal = mockGetToolResultData.mock.calls[0][1]?.signal;

      store.resetAutoWidgets();

      expect(agentSignal?.aborted).toBe(true);
      expect(toolSignal?.aborted).toBe(true);

      await agentPromise;
      await toolPromise;

      expect(store.agentInvocation.data).toBeNull();
      expect(store.toolResult.data).toBeNull();
    });
  });

  describe('Getters', () => {
    it('hasAgentInvocationData returns true when data has results', async () => {
      mockGetAgentInvocationData.mockResolvedValue({
        results: [
          {
            label: 'a',
            agent: { uuid: '1' },
            value: 10,
            full_value: 10,
          },
        ],
      });

      await store.loadAgentInvocationData();

      expect(store.hasAgentInvocationData).toBe(true);
    });

    it('hasAgentInvocationData returns false when data has empty results', async () => {
      mockGetAgentInvocationData.mockResolvedValue({ results: [] });

      await store.loadAgentInvocationData();

      expect(store.hasAgentInvocationData).toBe(false);
    });

    it('hasToolResultData returns true when data has results', async () => {
      mockGetToolResultData.mockResolvedValue({
        results: [
          {
            label: 't',
            agent: { uuid: '1' },
            value: 5,
            full_value: 5,
          },
        ],
      });

      await store.loadToolResultData();

      expect(store.hasToolResultData).toBe(true);
    });

    it('hasToolResultData returns false when data has empty results', async () => {
      mockGetToolResultData.mockResolvedValue({ results: [] });

      await store.loadToolResultData();

      expect(store.hasToolResultData).toBe(false);
    });
  });
});
