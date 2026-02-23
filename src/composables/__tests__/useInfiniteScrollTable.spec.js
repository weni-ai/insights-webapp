import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { useInfiniteScrollTable } from '../useInfiniteScrollTable';

describe('useInfiniteScrollTable', () => {
  let mockFetchData;
  let mockFormatResults;
  let mockOnSortChange;
  let composable;

  const mockResults = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  const mockFormattedResults = [
    { id: 1, name: 'Formatted 1' },
    { id: 2, name: 'Formatted 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchData = vi.fn().mockResolvedValue({
      results: mockResults,
      count: 10,
    });
    mockFormatResults = vi.fn((results) => {
      return results.map((item) => ({
        ...item,
        name: item.name.replace('Item', 'Formatted'),
      }));
    });
    mockOnSortChange = vi.fn();

    composable = useInfiniteScrollTable({
      fetchData: mockFetchData,
      formatResults: mockFormatResults,
      onSortChange: mockOnSortChange,
    });
  });

  describe('Initialization', () => {
    it('initializes with correct default values', () => {
      expect(composable.isLoading.value).toBe(false);
      expect(composable.isLoadingMore.value).toBe(false);
      expect(composable.currentPage.value).toBe(1);
      expect(composable.pageInterval.value).toBe(12);
      expect(composable.totalCount.value).toBe(0);
      expect(composable.formattedItems.value).toEqual([]);
    });

    it('uses custom pageSize when provided', () => {
      const customComposable = useInfiniteScrollTable({
        fetchData: mockFetchData,
        formatResults: mockFormatResults,
        pageSize: 20,
      });
      expect(customComposable.pageInterval.value).toBe(20);
    });
  });

  describe('hasMoreData computed', () => {
    it('returns true when there is more data', async () => {
      await composable.resetAndLoadData({ itemKey: 'id', order: 'asc' });
      expect(composable.hasMoreData.value).toBe(true);
    });

    it('returns false when all data is loaded', async () => {
      mockFetchData.mockResolvedValueOnce({ results: mockResults, count: 2 });
      await composable.resetAndLoadData({ itemKey: 'id', order: 'asc' });
      expect(composable.hasMoreData.value).toBe(false);
    });
  });

  describe('resetAndLoadData', () => {
    it('loads initial data correctly', async () => {
      await composable.resetAndLoadData({ itemKey: 'id', order: 'asc' });

      expect(mockFetchData).toHaveBeenCalledWith(1, 12, 'id');
      expect(composable.formattedItems.value).toHaveLength(2);
      expect(composable.totalCount.value).toBe(10);
      expect(composable.currentPage.value).toBe(2);
      expect(composable.isLoading.value).toBe(false);
    });

    it('builds descending ordering correctly', async () => {
      await composable.resetAndLoadData({ itemKey: 'name', order: 'desc' });
      expect(mockFetchData).toHaveBeenCalledWith(1, 12, '-name');
    });

    it('resets existing data before loading', async () => {
      composable.formattedItems.value = [{ id: 99, name: 'Old' }];
      composable.currentPage.value = 5;
      composable.totalCount.value = 100;

      await composable.resetAndLoadData({ itemKey: 'id', order: 'asc' });

      expect(composable.formattedItems.value).toHaveLength(2);
      expect(composable.currentPage.value).toBe(2);
    });

    it('handles errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockFetchData.mockRejectedValueOnce(new Error('Network error'));

      await composable.resetAndLoadData({ itemKey: 'id', order: 'asc' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(composable.isLoading.value).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadMoreData', () => {
    beforeEach(async () => {
      await composable.resetAndLoadData({ itemKey: 'id', order: 'asc' });
      vi.clearAllMocks();
    });

    it('loads next page of data', async () => {
      await composable.loadMoreData({ itemKey: 'id', order: 'asc' });

      expect(mockFetchData).toHaveBeenCalledWith(2, 12, 'id');
      expect(composable.formattedItems.value).toHaveLength(4);
      expect(composable.currentPage.value).toBe(3);
      expect(composable.isLoadingMore.value).toBe(false);
    });

    it('appends new items to existing items', async () => {
      const initialLength = composable.formattedItems.value.length;
      await composable.loadMoreData({ itemKey: 'id', order: 'asc' });
      expect(composable.formattedItems.value.length).toBeGreaterThan(
        initialLength,
      );
    });

    it('does not load when already loading', async () => {
      composable.isLoadingMore.value = true;
      await composable.loadMoreData({ itemKey: 'id', order: 'asc' });
      expect(mockFetchData).not.toHaveBeenCalled();
    });

    it('does not load when no more data', async () => {
      composable.totalCount.value = 2;
      await composable.loadMoreData({ itemKey: 'id', order: 'asc' });
      expect(mockFetchData).not.toHaveBeenCalled();
    });

    it('handles errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockFetchData.mockRejectedValueOnce(new Error('Load more error'));

      await composable.loadMoreData({ itemKey: 'id', order: 'asc' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(composable.isLoadingMore.value).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleSort', () => {
    it('updates currentSort and calls onSortChange without triggering fetch', () => {
      const currentSort = { value: { itemKey: 'id', order: 'asc' } };
      const newSort = { header: 'Name', itemKey: 'name', order: 'desc' };

      composable.handleSort(newSort, currentSort);

      expect(currentSort.value).toEqual(newSort);
      expect(mockOnSortChange).toHaveBeenCalled();
      expect(mockFetchData).not.toHaveBeenCalled();
    });

    it('works without onSortChange callback', () => {
      const noCallbackComposable = useInfiniteScrollTable({
        fetchData: mockFetchData,
        formatResults: mockFormatResults,
      });

      const currentSort = { value: { itemKey: 'id', order: 'asc' } };
      const newSort = { header: 'Name', itemKey: 'name', order: 'asc' };

      noCallbackComposable.handleSort(newSort, currentSort);

      expect(currentSort.value).toEqual(newSort);
      expect(mockFetchData).not.toHaveBeenCalled();
    });
  });

  describe('formatResults integration', () => {
    it('calls formatResults with fetched data', async () => {
      await composable.resetAndLoadData({ itemKey: 'id', order: 'asc' });

      expect(mockFormatResults).toHaveBeenCalledWith(mockResults);
      expect(composable.formattedItems.value[0].name).toContain('Formatted');
    });
  });
});

