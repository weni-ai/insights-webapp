import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createI18n } from 'vue-i18n';
import DateFilter from '../DateFilter.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        human_support: {
          filters: {
            date_range: 'Date Range',
          },
        },
      },
    },
  }),
];

const appliedDateRangeRef = ref({ start: '2024-01-01', end: '2024-01-31' });

const mockStore = {
  get appliedDateRange() {
    return appliedDateRangeRef.value;
  },
  set appliedDateRange(value) {
    appliedDateRangeRef.value = value;
  },
};

const mockRouter = {
  push: vi.fn(),
  currentRoute: {
    value: {
      query: {},
    },
  },
};

vi.mock('@/store/modules/humanSupport/humanSupport', () => ({
  useHumanSupport: () => mockStore,
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

vi.mock('pinia', async (importOriginal) => ({
  ...(await importOriginal()),
  storeToRefs: (store) => ({ appliedDateRange: appliedDateRangeRef }),
}));

const createWrapper = (storeState = {}) => {
  appliedDateRangeRef.value = storeState.appliedDateRange || {
    start: '2024-01-01',
    end: '2024-01-31',
  };

  return mount(DateFilter, {
    global: {
      stubs: {
        FilterDate: true,
      },
    },
  });
};

describe('DateFilter', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    appliedDateRangeRef.value = { start: '2024-01-01', end: '2024-01-31' };
    mockRouter.currentRoute.value.query = {};
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('renders FilterDate component', () => {
      expect(wrapper.findComponent({ name: 'FilterDate' }).exists()).toBe(true);
    });
  });

  describe('Model value updates', () => {
    it('updates store when model value changes', async () => {
      const filterDate = wrapper.findComponent({ name: 'FilterDate' });
      const newDateRange = { start: '2024-02-01', end: '2024-02-28' };

      await filterDate.vm.$emit('update:model-value', newDateRange);
      await nextTick();

      expect(mockStore.appliedDateRange).toEqual(newDateRange);
    });
  });

  describe('Router integration', () => {
    it('updates router query params on initial load', () => {
      expect(mockRouter.push).toHaveBeenCalledWith({
        query: {
          start_date: '2024-01-01',
          end_date: '2024-01-31',
        },
      });
    });

    it('updates router when appliedDateRange changes', async () => {
      vi.clearAllMocks();
      mockRouter.currentRoute.value.query = { other_param: 'value' };

      appliedDateRangeRef.value = { start: '2024-03-01', end: '2024-03-31' };
      await nextTick();

      expect(mockRouter.push).toHaveBeenCalledWith({
        query: {
          other_param: 'value',
          start_date: '2024-03-01',
          end_date: '2024-03-31',
        },
      });
    });

    it('preserves existing query params when updating date range', async () => {
      vi.clearAllMocks();
      mockRouter.currentRoute.value.query = {
        filter: 'test',
        page: '2',
      };

      const filterDate = wrapper.findComponent({ name: 'FilterDate' });
      await filterDate.vm.$emit('update:model-value', {
        start: '2024-04-01',
        end: '2024-04-30',
      });
      await nextTick();

      expect(mockRouter.push).toHaveBeenCalledWith({
        query: {
          filter: 'test',
          page: '2',
          start_date: '2024-04-01',
          end_date: '2024-04-30',
        },
      });
    });
  });
});
