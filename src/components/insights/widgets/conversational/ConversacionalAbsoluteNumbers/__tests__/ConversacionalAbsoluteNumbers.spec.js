/* eslint-disable vue/one-component-per-file, vue/require-prop-types */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';

import ConversationalAbsoluteNumbers from '../index.vue';
import NewMetric from '../NewMetric.vue';
import WidgetService from '@/services/api/resources/conversational/widgets';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';

vi.mock('@/services/api/resources/conversational/widgets', () => ({
  default: {
    getAbsoluteNumbersChildren: vi.fn(),
    getAbsoluteNumbersChildrenValue: vi.fn(),
  },
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useRoute: () => ({ query: {} }) };
});

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key) => key,
    },
  },
}));

vi.mock('@/utils/numbers', () => ({
  formatNumber: vi.fn((v) => String(v ?? 0)),
  formatCurrency: vi.fn((v) => String(v ?? 0)),
}));

vi.mock('@/utils/currency', () => ({
  currencySymbols: { BRL: 'R$', USD: '$' },
}));

vi.mock('@weni/unnnic-system', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, unnnicCallAlert: vi.fn() };
});

const makeI18n = () =>
  createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

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
      conversationalWidgets: {},
    },
  });
}

function mountComponent(
  props = { uuid: 'widget-uuid-1' },
  apiResults = [mockChild('c1', 'M1'), mockChild('c2', 'M2')],
) {
  WidgetService.getAbsoluteNumbersChildren.mockResolvedValue({
    results: apiResults,
  });

  return mount(ConversationalAbsoluteNumbers, {
    props,
    global: {
      plugins: [createPinia(), makeI18n()],
      mocks: { $t: (key) => key },
    },
  });
}

describe('ConversationalAbsoluteNumbers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    WidgetService.getAbsoluteNumbersChildrenValue.mockResolvedValue({
      value: 42,
    });
  });

  it('calls getAbsoluteNumbersChildren with widget uuid on mount', async () => {
    mountComponent({ uuid: 'my-widget-id' });
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

    const wrapper = mountComponent();
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
    const wrapper = mountComponent(undefined, [
      mockChild('child-a', 'Metric A', 'BRL'),
      mockChild('child-b', 'Metric B', ''),
    ]);
    await flushPromises();

    const metrics = wrapper.findAllComponents({
      name: 'AbsoluteNumbersMetric',
    });
    expect(metrics).toHaveLength(2);
    expect(metrics[0].props('metric')).toMatchObject({
      uuid: 'child-a',
      name: 'Metric A',
      config: expect.objectContaining({
        currency: expect.objectContaining({ code: 'BRL' }),
      }),
    });
    expect(metrics[0].props('parentName')).toBe('Absolute numbers widget');
    expect(metrics[1].props('metric')).toMatchObject({
      uuid: 'child-b',
      name: 'Metric B',
      config: expect.objectContaining({
        currency: expect.objectContaining({ code: null }),
      }),
    });
  });

  it('renders NewMetric when fewer than 6 children', async () => {
    const wrapper = mountComponent(undefined, [mockChild('c1', 'M1')]);
    await flushPromises();
    expect(wrapper.findComponent(NewMetric).exists()).toBe(true);
  });

  it('does not render NewMetric when there are 6 children', async () => {
    const six = Array.from({ length: 6 }, (_, i) =>
      mockChild(`c${i}`, `M${i}`),
    );
    const wrapper = mountComponent(undefined, six);
    await flushPromises();
    expect(wrapper.findComponent(NewMetric).exists()).toBe(false);
  });

  it('edit action fills form and opens customizable drawer', async () => {
    const pinia = createPinia();
    WidgetService.getAbsoluteNumbersChildren.mockResolvedValue({
      results: [mockChild('c1', 'M1')],
    });

    const wrapper = mount(ConversationalAbsoluteNumbers, {
      props: { uuid: 'widget-uuid-1' },
      global: {
        plugins: [pinia, makeI18n()],
        mocks: { $t: (k) => k },
      },
    });

    await flushPromises();

    const conversational = useConversational(pinia);
    const customWidgets = useCustomWidgets(pinia);

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
    const wrapper = mountComponent(undefined, []);
    await flushPromises();

    const card = wrapper.findComponent(
      '[data-testid="conversational-absolute-numbers-card"]',
    );
    card.props('actions')[1].onClick();
    await nextTick();

    const modal = wrapper.findComponent({ name: 'ModalRemoveWidget' });
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
        plugins: [pinia, makeI18n()],
        mocks: { $t: (k) => k },
      },
    });

    await flushPromises();

    const conversational = useConversational(pinia);
    const customWidgets = useCustomWidgets(pinia);

    await wrapper.findComponent(NewMetric).trigger('click');

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
