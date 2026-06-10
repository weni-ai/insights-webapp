import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useConversationalWidgets } from '../widgets';

const mockGetSearchTermsData = vi.fn();
const mockGetAddedToCartData = vi.fn();
const mockSaveNewWidget = vi.fn();
const mockDeleteWidget = vi.fn();
const mockFindWidgetBySource = vi.fn();
const mockGetCurrentDashboardWidgets = vi.fn();

vi.mock('@/services/api/resources/conversational/widgets', () => ({
  default: {
    getSearchTermsData: (...args: unknown[]) => mockGetSearchTermsData(...args),
    getAddedToCartData: (...args: unknown[]) => mockGetAddedToCartData(...args),
  },
}));

vi.mock('@/services/api/resources/widgets', () => ({
  default: {
    saveNewWidget: (...args: unknown[]) => mockSaveNewWidget(...args),
    deleteWidget: (...args: unknown[]) => mockDeleteWidget(...args),
  },
}));

vi.mock('@/store/modules/widgets', () => ({
  useWidgets: () => ({
    findWidgetBySource: (...args: unknown[]) => mockFindWidgetBySource(...args),
    getCurrentDashboardWidgets: (...args: unknown[]) =>
      mockGetCurrentDashboardWidgets(...args),
  }),
}));

vi.mock('@weni/unnnic-system', () => ({
  unnnicCallAlert: vi.fn(),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key: string) => key,
    },
  },
}));

describe('useConversationalWidgets store - product ranking widgets', () => {
  let store: ReturnType<typeof useConversationalWidgets>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useConversationalWidgets();
    vi.clearAllMocks();
    mockGetCurrentDashboardWidgets.mockResolvedValue(undefined);
  });

  describe('loadSearchTermWidgetData', () => {
    it('stores data when the API resolves', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      const response = { results: [{ label: 'a', value: 1, full_value: 10 }] };
      mockGetSearchTermsData.mockResolvedValue(response);

      await store.loadSearchTermWidgetData();

      expect(mockGetSearchTermsData).toHaveBeenCalledWith(
        { widget_uuid: 'search-uuid' },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(store.searchTermWidgetData).toEqual(response);
      expect(store.isSearchTermWidgetDataError).toBe(false);
      expect(store.isLoadingSearchTermWidgetData).toBe(false);
    });

    it('sets error state when the widget is not configured', async () => {
      mockFindWidgetBySource.mockReturnValue(undefined);
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await store.loadSearchTermWidgetData();

      expect(mockGetSearchTermsData).not.toHaveBeenCalled();
      expect(store.isSearchTermWidgetDataError).toBe(true);
      expect(store.searchTermWidgetData).toBeNull();
    });

    it('sets error state when the API rejects', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      mockGetSearchTermsData.mockRejectedValue(new Error('boom'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await store.loadSearchTermWidgetData();

      expect(store.isSearchTermWidgetDataError).toBe(true);
      expect(store.searchTermWidgetData).toBeNull();
    });

    it('aborts the previous request when called again', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      let resolveSecond: (_value: unknown) => void = () => {};

      mockGetSearchTermsData
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
            resolveSecond = resolve;
          }),
        );

      store.loadSearchTermWidgetData();
      store.loadSearchTermWidgetData();

      const firstSignal = mockGetSearchTermsData.mock.calls[0][1]?.signal;
      expect(firstSignal?.aborted).toBe(true);

      resolveSecond({ results: [] });
    });
  });

  describe('loadAddedToCartWidgetData', () => {
    it('stores data when the API resolves', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'cart-uuid' });
      const response = { results: [{ label: 'b', value: 2, full_value: 20 }] };
      mockGetAddedToCartData.mockResolvedValue(response);

      await store.loadAddedToCartWidgetData();

      expect(mockGetAddedToCartData).toHaveBeenCalledWith(
        { widget_uuid: 'cart-uuid' },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(store.addedToCartWidgetData).toEqual(response);
      expect(store.isAddedToCartWidgetDataError).toBe(false);
    });

    it('sets error state when the API rejects', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'cart-uuid' });
      mockGetAddedToCartData.mockRejectedValue(new Error('boom'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await store.loadAddedToCartWidgetData();

      expect(store.isAddedToCartWidgetDataError).toBe(true);
      expect(store.addedToCartWidgetData).toBeNull();
    });
  });

  describe('configured getters', () => {
    it('isSearchTermConfigured is true when the widget exists', () => {
      mockFindWidgetBySource.mockImplementation((source: string) =>
        source === 'conversations.search_term' ? { uuid: 's' } : undefined,
      );
      expect(store.isSearchTermConfigured).toBe(true);
    });

    it('isSearchTermConfigured is false when the widget is missing', () => {
      mockFindWidgetBySource.mockReturnValue(undefined);
      expect(store.isSearchTermConfigured).toBe(false);
    });

    it('isAddedToCartConfigured is true when the widget exists', () => {
      mockFindWidgetBySource.mockImplementation((source: string) =>
        source === 'conversations.added_to_cart' ? { uuid: 'c' } : undefined,
      );
      expect(store.isAddedToCartConfigured).toBe(true);
    });

    it('isAddedToCartConfigured is false when the widget is missing', () => {
      mockFindWidgetBySource.mockReturnValue(undefined);
      expect(store.isAddedToCartConfigured).toBe(false);
    });
  });

  describe('saveNewWidget', () => {
    it('triggers loadSearchTermWidgetData for the search_term source', async () => {
      mockSaveNewWidget.mockResolvedValue(undefined);
      const loadSpy = vi
        .spyOn(store, 'loadSearchTermWidgetData')
        .mockResolvedValue(undefined);

      store.newWidget = {
        uuid: '',
        name: 'conversations_dashboard.search_term',
        config: {},
        type: 'search_term',
        source: 'conversations.search_term',
        is_configurable: true,
      } as never;

      await store.saveNewWidget();

      expect(mockSaveNewWidget).toHaveBeenCalled();
      expect(loadSpy).toHaveBeenCalled();
    });

    it('triggers loadAddedToCartWidgetData for the added_to_cart source', async () => {
      mockSaveNewWidget.mockResolvedValue(undefined);
      const loadSpy = vi
        .spyOn(store, 'loadAddedToCartWidgetData')
        .mockResolvedValue(undefined);

      store.newWidget = {
        uuid: '',
        name: 'conversations_dashboard.added_to_cart',
        config: {},
        type: 'added_to_cart',
        source: 'conversations.added_to_cart',
        is_configurable: true,
      } as never;

      await store.saveNewWidget();

      expect(loadSpy).toHaveBeenCalled();
    });
  });

  describe('deleteWidget', () => {
    it('deletes the widget found for the search_term source', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      mockDeleteWidget.mockResolvedValue(undefined);

      await store.deleteWidget('search_term');

      expect(mockFindWidgetBySource).toHaveBeenCalledWith(
        'conversations.search_term',
      );
      expect(mockDeleteWidget).toHaveBeenCalledWith('search-uuid');
    });

    it('deletes the widget found for the added_to_cart source', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'cart-uuid' });
      mockDeleteWidget.mockResolvedValue(undefined);

      await store.deleteWidget('added_to_cart');

      expect(mockFindWidgetBySource).toHaveBeenCalledWith(
        'conversations.added_to_cart',
      );
      expect(mockDeleteWidget).toHaveBeenCalledWith('cart-uuid');
    });

    it('rethrows when the deletion fails', async () => {
      mockFindWidgetBySource.mockReturnValue({ uuid: 'search-uuid' });
      mockDeleteWidget.mockRejectedValue(new Error('delete failed'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(store.deleteWidget('search_term')).rejects.toThrow(
        'delete failed',
      );
    });
  });
});
