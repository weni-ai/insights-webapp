/* eslint-disable vue/one-component-per-file, vue/require-prop-types */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import AbsoluteNumbersMetric from '../AbsoluteNumbersMetric.vue';
import WidgetService from '@/services/api/resources/conversational/widgets';
import { formatCurrency, formatNumber } from '@/utils/numbers';

vi.mock('@/services/api/resources/conversational/widgets', () => ({
  default: {
    getAbsoluteNumbersChildrenValue: vi.fn(),
  },
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRoute: () => ({ query: {} }),
  };
});

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
    },
  },
}));

vi.mock('@/utils/numbers', () => ({
  formatNumber: vi.fn((v) => `fmt-num(${v})`),
  formatCurrency: vi.fn((v, currency) => `fmt-cur(${currency}${v})`),
}));

const defaultProps = {
  uuid: 'metric-uuid-1',
  title: 'Tickets',
  currency: '',
  parentName: 'Dashboard widget',
};

const CardWidgetContainerStub = defineComponent({
  name: 'CardWidgetContainer',
  inheritAttrs: true,
  props: {
    actions: { type: Array, default: () => [] },
  },
  template: `
    <div>
      <slot name="header-title" />
      <slot />
    </div>
  `,
});

function createWrapper(props = {}, piniaOptions = {}) {
  const pinia = createTestingPinia({
    stubActions: false,
    initialState: {
      conversational: {
        refreshDataConversational: false,
        ...piniaOptions.conversational,
      },
    },
  });

  return shallowMount(AbsoluteNumbersMetric, {
    props: { ...defaultProps, ...props },
    global: {
      plugins: [pinia],
      stubs: {
        UnnnicSkeletonLoading: defineComponent({
          name: 'UnnnicSkeletonLoading',
          inheritAttrs: true,
          template: '<div />',
        }),
        CardWidgetContainer: CardWidgetContainerStub,
        ModalRemoveWidget: defineComponent({
          name: 'ModalRemoveWidget',
          inheritAttrs: true,
          props: ['modelValue', 'uuid', 'title', 'type', 'size'],
          template: '<div />',
        }),
      },
      mocks: {
        $t: (key, params) =>
          params ? `${key}:${JSON.stringify(params)}` : key,
      },
    },
  });
}

describe('AbsoluteNumbersMetric', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    WidgetService.getAbsoluteNumbersChildrenValue.mockResolvedValue({
      value: 42,
    });
  });

  it('shows skeleton while loading then shows metric content', async () => {
    let resolveLoad;
    const loadPromise = new Promise((r) => {
      resolveLoad = r;
    });
    WidgetService.getAbsoluteNumbersChildrenValue.mockImplementation(() =>
      loadPromise.then(() => ({ value: 10 })),
    );

    const wrapper = createWrapper();
    await nextTick();

    expect(
      wrapper.find('[data-testid="absolute-numbers-metric-skeleton"]').exists(),
    ).toBe(true);

    resolveLoad();
    await flushPromises();
    await nextTick();

    expect(
      wrapper.find('[data-testid="absolute-numbers-metric-skeleton"]').exists(),
    ).toBe(false);
    expect(
      wrapper.find('[data-testid="absolute-numbers-metric-title"]').text(),
    ).toBe('Tickets');
    expect(
      wrapper.find('[data-testid="absolute-numbers-metric-value"]').text(),
    ).toBe('fmt-num(10)');
  });

  it('fetches value with widget uuid on mount', async () => {
    createWrapper({ uuid: 'my-child-uuid' });
    await flushPromises();
    expect(WidgetService.getAbsoluteNumbersChildrenValue).toHaveBeenCalledWith(
      'my-child-uuid',
    );
  });

  it('displays formatNumber when currency is empty', async () => {
    const wrapper = createWrapper({ currency: '' });
    await flushPromises();
    expect(formatNumber).toHaveBeenCalledWith(42);
    expect(
      wrapper.find('[data-testid="absolute-numbers-metric-value"]').text(),
    ).toBe('fmt-num(42)');
  });

  it('displays formatCurrency when currency code is set', async () => {
    const wrapper = createWrapper({ currency: 'BRL' });
    await flushPromises();
    expect(formatCurrency).toHaveBeenCalledWith(42, 'R$ ');
    expect(
      wrapper.find('[data-testid="absolute-numbers-metric-value"]').text(),
    ).toBe('fmt-cur(R$ 42)');
  });

  it('emits edit with uuid when edit action runs', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    const card = wrapper.findComponent(
      '[data-testid="absolute-numbers-metric-card"]',
    );
    const [editAction] = card.props('actions');
    editAction.onClick();

    expect(wrapper.emitted('edit')).toEqual([['metric-uuid-1']]);
  });

  it('opens remove modal when delete action runs', async () => {
    const wrapper = createWrapper();
    await flushPromises();

    const card = wrapper.findComponent(
      '[data-testid="absolute-numbers-metric-card"]',
    );
    const [, deleteAction] = card.props('actions');
    deleteAction.onClick();
    await nextTick();

    const modal = wrapper.findComponent(
      '[data-testid="absolute-numbers-metric-remove-modal"]',
    );
    expect(modal.exists()).toBe(true);
    expect(modal.props('uuid')).toBe('metric-uuid-1');
    expect(modal.props('type')).toBe('absolute_numbers_child');
  });

  it('passes two actions to CardWidgetContainer', async () => {
    const wrapper = createWrapper();
    await flushPromises();
    const actions = wrapper
      .findComponent('[data-testid="absolute-numbers-metric-card"]')
      .props('actions');
    expect(actions).toHaveLength(2);
    expect(actions[0].icon).toBe('edit_square');
    expect(actions[1].icon).toBe('delete');
    expect(actions[1].scheme).toBe('aux-red-500');
  });
});
