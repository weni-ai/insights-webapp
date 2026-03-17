/* eslint-disable vue/one-component-per-file, vue/require-prop-types */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ConversationalAbsoluteNumbers from '../index.vue';
import WidgetService from '@/services/api/resources/conversational/widgets';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';

vi.mock('@/services/api/resources/conversational/widgets', () => ({
  default: {
    getAbsoluteNumbersChildren: vi.fn(),
  },
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
    },
  },
}));

const mockChild = (uuid, name, currencyCode = '') => ({
  uuid,
  name,
  parent: '',
  config: {
    index: 1,
    agent_uuid: '',
    key: '',
    operation: '',
    value_field_name: '',
    currency: { is_active: !!currencyCode, code: currencyCode || null },
  },
});

const CardWidgetContainerStub = defineComponent({
  name: 'CardWidgetContainer',
  inheritAttrs: true,
  props: {
    actions: { type: Array, default: () => [] },
    title: { type: String, default: '' },
    hiddenTabs: Boolean,
  },
  template: `
    <div>
      <slot name="header-title" />
      <slot />
    </div>
  `,
});

function createPinia() {
  return createTestingPinia({
    stubActions: false,
    initialState: {
      customWidgets: {
        customWidgets: [
          {
            uuid: 'widget-uuid-1',
            name: 'Absolute numbers widget',
            source: 'conversations.custom',
            type: 'absolute_numbers',
            data: {},
            config: {},
          },
        ],
        absoluteNumbersForm: {
          widget_uuid: '',
          name: '',
          children: [],
        },
      },
      conversational: {},
    },
  });
}

function mountIndex(
  props = { uuid: 'widget-uuid-1' },
  apiResults = [mockChild('c1', 'M1'), mockChild('c2', 'M2')],
) {
  WidgetService.getAbsoluteNumbersChildren.mockResolvedValue({
    results: apiResults,
  });

  return mount(ConversationalAbsoluteNumbers, {
    props,
    global: {
      plugins: [createPinia()],
      stubs: {
        UnnnicSkeletonLoading: defineComponent({
          name: 'UnnnicSkeletonLoading',
          inheritAttrs: true,
          template: '<div />',
        }),
        CardWidgetContainer: CardWidgetContainerStub,
        AbsoluteNumbersMetric: defineComponent({
          name: 'AbsoluteNumbersMetric',
          props: ['uuid', 'title', 'currency', 'parentName'],
          emits: ['edit'],
          template: '<div />',
        }),
        NewMetric: defineComponent({
          name: 'NewMetric',
          template: '<button type="button" data-testid="new-metric-stub" />',
        }),
        ModalRemoveWidget: defineComponent({
          name: 'ModalRemoveWidget',
          inheritAttrs: true,
          props: ['modelValue', 'uuid', 'type', 'size'],
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

describe('ConversationalAbsoluteNumbers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getAbsoluteNumbersChildren with widget uuid on mount', async () => {
    mountIndex({ uuid: 'my-widget-id' });
    await flushPromises();
    expect(WidgetService.getAbsoluteNumbersChildren).toHaveBeenCalledWith(
      'my-widget-id',
    );
  });

  it('shows skeleton while loading then card with title', async () => {
    let resolveLoad;
    const p = new Promise((r) => {
      resolveLoad = r;
    });
    WidgetService.getAbsoluteNumbersChildren.mockImplementation(() =>
      p.then(() => ({ results: [] })),
    );

    const wrapper = mountIndex();
    await nextTick();

    expect(
      wrapper
        .find('[data-testid="conversational-absolute-numbers-skeleton"]')
        .exists(),
    ).toBe(true);

    resolveLoad();
    await flushPromises();
    await nextTick();

    expect(
      wrapper
        .find('[data-testid="conversational-absolute-numbers-skeleton"]')
        .exists(),
    ).toBe(false);
    expect(
      wrapper
        .find('[data-testid="conversational-absolute-numbers-title"]')
        .text(),
    ).toBe('Absolute numbers widget');
  });

  it('renders one AbsoluteNumbersMetric per child with correct props', async () => {
    const wrapper = mountIndex(undefined, [
      mockChild('child-a', 'Metric A', 'BRL'),
      mockChild('child-b', 'Metric B', ''),
    ]);
    await flushPromises();

    const metrics = wrapper.findAllComponents({
      name: 'AbsoluteNumbersMetric',
    });
    expect(metrics).toHaveLength(2);
    expect(metrics[0].props()).toMatchObject({
      uuid: 'child-a',
      title: 'Metric A',
      currency: 'BRL',
      parentName: 'Absolute numbers widget',
    });
    expect(metrics[1].props()).toMatchObject({
      uuid: 'child-b',
      title: 'Metric B',
      currency: '',
    });
  });

  it('renders NewMetric when fewer than 6 children', async () => {
    const wrapper = mountIndex(undefined, [mockChild('c1', 'M1')]);
    await flushPromises();
    expect(wrapper.find('[data-testid="new-metric-stub"]').exists()).toBe(true);
  });

  it('does not render NewMetric when there are 6 children', async () => {
    const six = Array.from({ length: 6 }, (_, i) =>
      mockChild(`c${i}`, `M${i}`),
    );
    const wrapper = mountIndex(undefined, six);
    await flushPromises();
    expect(wrapper.find('[data-testid="new-metric-stub"]').exists()).toBe(
      false,
    );
  });

  it('edit action fills form and opens customizable drawer', async () => {
    const pinia = createPinia();
    WidgetService.getAbsoluteNumbersChildren.mockResolvedValue({
      results: [mockChild('c1', 'M1')],
    });

    const wrapper = mount(ConversationalAbsoluteNumbers, {
      props: { uuid: 'widget-uuid-1' },
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicSkeletonLoading: defineComponent({
            name: 'UnnnicSkeletonLoading',
            inheritAttrs: true,
            template: '<div />',
          }),
          CardWidgetContainer: CardWidgetContainerStub,
          AbsoluteNumbersMetric: true,
          NewMetric: true,
          ModalRemoveWidget: true,
        },
        mocks: {
          $t: (k, p) => (p ? `${k}` : k),
        },
      },
    });

    await flushPromises();

    const conversational = useConversational();
    const customWidgets = useCustomWidgets();

    const card = wrapper.findComponent(
      '[data-testid="conversational-absolute-numbers-card"]',
    );
    card.props('actions')[0].onClick();

    expect(customWidgets.absoluteNumbersForm).toEqual({
      widget_uuid: 'widget-uuid-1',
      name: 'Absolute numbers widget',
      children: [expect.objectContaining({ uuid: 'c1', name: 'M1' })],
    });
    expect(conversational.isDrawerCustomizableOpen).toBe(true);
    expect(conversational.drawerWidgetType).toBe('absolute_numbers');
    expect(conversational.isNewDrawerCustomizable).toBe(false);
  });

  it('opens remove modal when delete action runs', async () => {
    const wrapper = mountIndex(undefined, []);
    await flushPromises();

    const card = wrapper.findComponent(
      '[data-testid="conversational-absolute-numbers-card"]',
    );
    card.props('actions')[1].onClick();
    await nextTick();

    const modal = wrapper.findComponent(
      '[data-testid="conversational-absolute-numbers-remove-modal"]',
    );
    expect(modal.exists()).toBe(true);
    expect(modal.props('uuid')).toBe('widget-uuid-1');
    expect(modal.props('type')).toBe('absolute_numbers');
  });

  it('NewMetric click adds empty child and opens drawer', async () => {
    const pinia = createPinia();
    WidgetService.getAbsoluteNumbersChildren.mockResolvedValue({
      results: [mockChild('c1', 'M1')],
    });

    const wrapper = mount(ConversationalAbsoluteNumbers, {
      props: { uuid: 'widget-uuid-1' },
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicSkeletonLoading: defineComponent({
            name: 'UnnnicSkeletonLoading',
            inheritAttrs: true,
            template: '<div />',
          }),
          CardWidgetContainer: CardWidgetContainerStub,
          AbsoluteNumbersMetric: true,
          NewMetric: defineComponent({
            name: 'NewMetric',
            template:
              '<button data-testid="new-metric-click" @click="$emit(\'click\')" />',
          }),
          ModalRemoveWidget: true,
        },
        mocks: { $t: (k) => k },
      },
    });

    await flushPromises();

    const conversational = useConversational();
    const customWidgets = useCustomWidgets();

    await wrapper.find('[data-testid="new-metric-click"]').trigger('click');

    expect(customWidgets.absoluteNumbersForm.children).toHaveLength(2);
    expect(customWidgets.absoluteNumbersForm.children[1]).toMatchObject({
      name: '',
      config: expect.objectContaining({
        agent_uuid: '',
        key: '',
        currency: { is_active: false, code: null },
      }),
    });
    expect(conversational.isDrawerCustomizableOpen).toBe(true);
    expect(conversational.drawerWidgetType).toBe('absolute_numbers');
  });
});
