/* eslint-disable vue/one-component-per-file, vue/require-prop-types -- stubs locais */
import { describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { defineComponent, nextTick } from 'vue';

import AbsoluteNumbersForm from '../AbsoluteNumbersForm.vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key) => key,
    },
  },
}));

const emptyAbsoluteForm = () => ({
  widget_uuid: '',
  name: '',
  children: [],
});

const oneChildForm = () => ({
  widget_uuid: 'w-1',
  name: 'Widget',
  children: [
    {
      name: 'Metric A',
      parent: '',
      config: {
        index: 1,
        agent_uuid: 'ag-1',
        key: 'k1',
        operation: 'SUM',
        value_field_name: 'v1',
        currency: { is_active: false, code: null },
      },
    },
  ],
});

function createPinia(customWidgetsPartial = {}) {
  return createTestingPinia({
    stubActions: false,
    initialState: {
      project: {
        agentsTeam: {
          manager: null,
          agents: [
            { uuid: 'ag-1', name: 'Agent One' },
            { uuid: 'ag-2', name: 'Agent Two' },
          ],
        },
      },
      customWidgets: {
        absoluteNumbersForm: emptyAbsoluteForm(),
        ...customWidgetsPartial,
      },
    },
  });
}

function mountForm(pinia) {
  return shallowMount(AbsoluteNumbersForm, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key) => key,
      },
      stubs: {
        UnnnicInput: defineComponent({
          name: 'UnnnicInput',
          inheritAttrs: true,
          props: ['modelValue', 'label', 'placeholder', 'message'],
          template: '<input />',
        }),
        UnnnicSelect: defineComponent({
          name: 'UnnnicSelect',
          inheritAttrs: true,
          props: [
            'modelValue',
            'options',
            'itemLabel',
            'itemValue',
            'label',
            'placeholder',
            'search',
            'enableSearch',
            'optionsLines',
          ],
          emits: ['update:modelValue', 'update:search'],
          template: '<div />',
        }),
        UnnnicCheckbox: defineComponent({
          name: 'UnnnicCheckbox',
          inheritAttrs: true,
          props: ['modelValue', 'label'],
          emits: ['update:modelValue'],
          template: '<div />',
        }),
        UnnnicButton: defineComponent({
          name: 'UnnnicButton',
          inheritAttrs: true,
          props: ['text', 'type', 'disabled'],
          emits: ['click'],
          template:
            '<button type="button" :disabled="disabled" @click="$emit(\'click\')"></button>',
        }),
      },
    },
  });
}

describe('AbsoluteNumbersForm', () => {
  describe('rendering', () => {
    it('renders root section with expected class', () => {
      const pinia = createPinia();
      const wrapper = mountForm(pinia);
      expect(wrapper.find('.absolute-numbers-form').exists()).toBe(true);
    });

    it('renders widget name input and add-child button', () => {
      const pinia = createPinia();
      const wrapper = mountForm(pinia);
      expect(
        wrapper.findAllComponents({ name: 'UnnnicInput' }).length,
      ).toBeGreaterThan(0);
      expect(
        wrapper.find('[data-testid="absolute-numbers-add-child"]').exists(),
      ).toBe(true);
    });
  });

  describe('onMounted — initial child', () => {
    it('adds one child when children array is empty', async () => {
      const pinia = createPinia({
        absoluteNumbersForm: emptyAbsoluteForm(),
      });
      mountForm(pinia);
      await nextTick();

      const store = useCustomWidgets();
      expect(store.absoluteNumbersForm.children).toHaveLength(1);
      expect(store.absoluteNumbersForm.children[0].name).toBe('');
      expect(store.absoluteNumbersForm.children[0].config.agent_uuid).toBe('');
      expect(
        store.absoluteNumbersForm.children[0].config.currency.is_active,
      ).toBe(false);
    });

    it('does not add a child when children already exist', async () => {
      const pinia = createPinia({
        absoluteNumbersForm: oneChildForm(),
      });
      mountForm(pinia);
      await nextTick();

      const store = useCustomWidgets();
      expect(store.absoluteNumbersForm.children).toHaveLength(1);
      expect(store.absoluteNumbersForm.children[0].name).toBe('Metric A');
    });
  });

  describe('onUnmounted', () => {
    it('resets absoluteNumbersForm in the store', async () => {
      const pinia = createPinia({
        absoluteNumbersForm: {
          widget_uuid: 'uuid-x',
          name: 'My widget',
          children: [
            {
              name: 'C1',
              parent: '',
              config: {
                index: 1,
                agent_uuid: 'ag-1',
                key: 'key',
                operation: 'SUM',
                value_field_name: 'vf',
                currency: { is_active: true, code: 'USD' },
              },
            },
          ],
        },
      });
      const wrapper = mountForm(pinia);
      await nextTick();

      wrapper.unmount();

      const store = useCustomWidgets();
      expect(store.absoluteNumbersForm).toEqual({
        widget_uuid: '',
        name: '',
        children: [],
      });
    });
  });

  describe('handleAddChild', () => {
    it('appends a new child with default config when button is clicked', async () => {
      const pinia = createPinia({
        absoluteNumbersForm: oneChildForm(),
      });
      const wrapper = mountForm(pinia);
      await nextTick();

      const store = useCustomWidgets();
      const before = store.absoluteNumbersForm.children.length;

      await wrapper
        .findComponent('[data-testid="absolute-numbers-add-child"]')
        .vm.$emit('click');
      await nextTick();

      expect(store.absoluteNumbersForm.children).toHaveLength(before + 1);
      const last = store.absoluteNumbersForm.children.at(-1);
      expect(last.name).toBe('');
      expect(last.config.index).toBe(before + 1);
      expect(last.config.currency.is_active).toBe(false);
      expect(last.config.currency.code).toBe(null);
    });
  });

  describe('disabledAddChildButton', () => {
    it('disables add button when there are 6 children', async () => {
      const children = Array.from({ length: 6 }, (_, i) => ({
        name: `M${i}`,
        parent: '',
        config: {
          index: i + 1,
          agent_uuid: '',
          key: '',
          operation: '',
          value_field_name: '',
          currency: { is_active: false, code: null },
        },
      }));
      const pinia = createPinia({
        absoluteNumbersForm: {
          widget_uuid: '',
          name: '',
          children,
        },
      });
      const wrapper = mountForm(pinia);
      await nextTick();

      const btn = wrapper.findComponent(
        '[data-testid="absolute-numbers-add-child"]',
      );
      expect(btn.props('disabled')).toBe(true);
    });

    it('enables add button when there are fewer than 6 children', async () => {
      const pinia = createPinia({
        absoluteNumbersForm: oneChildForm(),
      });
      const wrapper = mountForm(pinia);
      await nextTick();

      const btn = wrapper.findComponent(
        '[data-testid="absolute-numbers-add-child"]',
      );
      expect(btn.props('disabled')).toBe(false);
    });
  });

  describe('handleCurrencySwitch', () => {
    it('sets currency code to BRL when currency is activated', async () => {
      const pinia = createPinia({
        absoluteNumbersForm: {
          widget_uuid: '',
          name: '',
          children: [
            {
              name: '',
              parent: '',
              config: {
                index: 1,
                agent_uuid: '',
                key: '',
                operation: '',
                value_field_name: '',
                currency: { is_active: false, code: null },
              },
            },
          ],
        },
      });
      const wrapper = mountForm(pinia);
      await nextTick();

      const store = useCustomWidgets();
      const currencyCheckbox = wrapper.findComponent(
        '[data-testid="absolute-numbers-currency-checkbox-0"]',
      );
      expect(currencyCheckbox.exists()).toBe(true);
      await currencyCheckbox.vm.$emit('update:modelValue', true);
      await nextTick();

      expect(
        store.absoluteNumbersForm.children[0].config.currency.is_active,
      ).toBe(true);
      expect(store.absoluteNumbersForm.children[0].config.currency.code).toBe(
        'BRL',
      );
    });

    it('clears currency code when currency is deactivated', async () => {
      const pinia = createPinia({
        absoluteNumbersForm: {
          widget_uuid: '',
          name: '',
          children: [
            {
              name: '',
              parent: '',
              config: {
                index: 1,
                agent_uuid: '',
                key: '',
                operation: '',
                value_field_name: '',
                currency: { is_active: true, code: 'BRL' },
              },
            },
          ],
        },
      });
      const wrapper = mountForm(pinia);
      await nextTick();

      const store = useCustomWidgets();
      const currencyCheckbox = wrapper.findComponent(
        '[data-testid="absolute-numbers-currency-checkbox-0"]',
      );
      expect(currencyCheckbox.exists()).toBe(true);
      await currencyCheckbox.vm.$emit('update:modelValue', false);
      await nextTick();

      expect(
        store.absoluteNumbersForm.children[0].config.currency.is_active,
      ).toBe(false);
      expect(store.absoluteNumbersForm.children[0].config.currency.code).toBe(
        '',
      );
    });
  });

  describe('UnnnicSelect for agents', () => {
    it('passes agents from project store as options on agent select', async () => {
      const pinia = createPinia({
        absoluteNumbersForm: oneChildForm(),
      });
      const wrapper = mountForm(pinia);
      await nextTick();

      const agentSelect = wrapper.findComponent(
        '[data-testid="absolute-numbers-agent-select-0"]',
      );
      expect(agentSelect.exists()).toBe(true);
      expect(agentSelect.props('options')).toEqual([
        { uuid: 'ag-1', name: 'Agent One' },
        { uuid: 'ag-2', name: 'Agent Two' },
      ]);
    });
  });
});
