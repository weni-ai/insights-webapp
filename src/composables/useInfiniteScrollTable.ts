import { ref, computed } from 'vue';

interface UseInfiniteScrollTableOptions<T, R> {
  pageSize?: number;
  fetchData: (
    _page: number,
    _pageSize: number,
    _ordering: string,
  ) => Promise<{ results: T[]; count: number }>;
  formatResults: (_results: T[]) => R[];
  onSortChange?: () => void;
}

export function useInfiniteScrollTable<T = any, R = any>(
  options: UseInfiniteScrollTableOptions<T, R>,
) {
  const { pageSize = 12, fetchData, formatResults, onSortChange } = options;

  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const currentPage = ref(1);
  const pageInterval = ref(pageSize);
  const totalCount = ref(0);
  const formattedItems = ref<R[]>([]) as any;

  const hasMoreData = computed(
    () => formattedItems.value.length < totalCount.value,
  );

  const buildOrdering = (sort: { itemKey: string; order: string }) => {
    return sort.order === 'desc' ? `-${sort.itemKey}` : sort.itemKey;
  };

  const loadMoreData = async (currentSort: {
    itemKey: string;
    order: string;
  }) => {
    if (isLoadingMore.value || !hasMoreData.value) return;

    isLoadingMore.value = true;

    try {
      const ordering = buildOrdering(currentSort);
      const data = await fetchData(
        currentPage.value,
        pageInterval.value,
        ordering,
      );

      if (data.results) {
        const newItems = formatResults(data.results);
        formattedItems.value = [...formattedItems.value, ...newItems];
        totalCount.value = data.count;
        currentPage.value++;
      }
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      isLoadingMore.value = false;
    }
  };

  const resetAndLoadData = async (currentSort: {
    itemKey: string;
    order: string;
  }) => {
    isLoading.value = true;
    currentPage.value = 1;
    formattedItems.value = [];
    totalCount.value = 0;

    try {
      const ordering = buildOrdering(currentSort);
      const data = await fetchData(1, pageInterval.value, ordering);

      if (data.results) {
        formattedItems.value = formatResults(data.results);
        totalCount.value = data.count;
        currentPage.value = 2;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const handleSort = (
    sort: { header: string; itemKey: string; order: string },
    currentSort: any,
  ) => {
    currentSort.value = sort;
    onSortChange?.();
    resetAndLoadData(sort);
  };

  return {
    isLoading,
    isLoadingMore,
    currentPage,
    pageInterval,
    totalCount,
    formattedItems,
    hasMoreData,
    loadMoreData,
    resetAndLoadData,
    handleSort,
  };
}
