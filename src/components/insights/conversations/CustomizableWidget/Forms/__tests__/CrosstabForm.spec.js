import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import CrosstabForm from '../CrosstabForm.vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';

const emptyForm = () => ({
  reference_field: '',
  widget_uuid: '',
  widget_name: '',
  key_a: '',
  field_name_a: '',
  key_b: '',
  field_name_b: '',
});

const filledForm = () => ({
  reference_field: 'order_id',
  widget_uuid: 'uuid-1',
  widget_name: 'Orders by channel',
  key_a: 'channel',
  field_name_a: 'Channel',
  key_b: 'status',
  field_name_b: 'Status',
});

const createPinia = (crosstabForm = emptyForm()) =>
  createTestingPinia({
    stubActions: false,
    initialState: {
      customWidgets: { crosstabForm },
    },
  });

const mountForm = (pinia) =>
  shallowMount(CrosstabForm, {
    global: {
      plugins: [pinia],
      mocks: {
        $t: (key) => key,
      },
      stubs: {
        UnnnicInput: {
          name: 'UnnnicInput',
          props: ['modelValue', 'label', 'placeholder'],
          emits: ['update:modelValue'],
          template:
            '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
        UnnnicDisclaimer: {
          name: 'UnnnicDisclaimer',
          template:
            '<div class="disclaimer-stub"><slot name="description" /></div>',
        },
      },
    },
  });

const inputFields = [
  {
    label: 'conversations_dashboard.customize_your_dashboard.label_widget_name',
    placeholder:
      'conversations_dashboard.customize_your_dashboard.set_widget_name',
    key: 'widget_name',
    value: 'Orders by channel',
  },
  {
    label: 'key',
    placeholder: 'conversations_dashboard.customize_your_dashboard.select_key',
    key: 'key_a',
    value: 'channel',
  },
  {
    label: 'field_name (optional)',
    placeholder:
      'conversations_dashboard.customize_your_dashboard.enter_field_name',
    key: 'field_name_a',
    value: 'Channel',
  },
  {
    label: 'key',
    placeholder: 'conversations_dashboard.customize_your_dashboard.select_key',
    key: 'key_b',
    value: 'status',
  },
  {
    label: 'field_name (optional)',
    placeholder:
      'conversations_dashboard.customize_your_dashboard.enter_field_name',
    key: 'field_name_b',
    value: 'Status',
  },
  {
    label: 'field_name (optional)',
    placeholder:
      'conversations_dashboard.customize_your_dashboard.enter_field_name',
    key: 'reference_field',
    value: 'order_id',
  },
];

describe('CrosstabForm', () => {
  it('renders the crosstab instructions and the six form fields', () => {
    const wrapper = mountForm(createPinia());
    const descriptions = wrapper.findAll('.crosstab-form__description');

    expect(wrapper.find('.crosstab-form').exists()).toBe(true);
    expect(wrapper.find('.crosstab-form__divider').exists()).toBe(true);
    expect(wrapper.find('.crosstab-form__disclaimer').exists()).toBe(true);
    expect(descriptions.map((node) => node.text())).toEqual([
      'conversations_dashboard.customize_your_dashboard.crosstab.drawer.description',
      'conversations_dashboard.customize_your_dashboard.crosstab.drawer.first_data_label',
      'conversations_dashboard.customize_your_dashboard.crosstab.drawer.second_data_label',
      'conversations_dashboard.customize_your_dashboard.crosstab.drawer.reference_field_label',
    ]);
    expect(wrapper.find('.disclaimer-stub').text()).toBe(
      'conversations_dashboard.customize_your_dashboard.crosstab.drawer.disclaimer',
    );
    expect(wrapper.findAllComponents({ name: 'UnnnicInput' })).toHaveLength(6);
  });

  it('binds each input to the crosstab form in the store', () => {
    const wrapper = mountForm(createPinia(filledForm()));
    const inputs = wrapper.findAllComponents({ name: 'UnnnicInput' });

    inputFields.forEach((field, index) => {
      expect(inputs[index].props('label')).toBe(field.label);
      expect(inputs[index].props('placeholder')).toBe(field.placeholder);
      expect(inputs[index].props('modelValue')).toBe(field.value);
    });
  });

  it('writes input changes back to the store', async () => {
    const pinia = createPinia(filledForm());
    const wrapper = mountForm(pinia);
    const store = useCustomWidgets();
    const inputs = wrapper.findAllComponents({ name: 'UnnnicInput' });

    for (const [index, field] of inputFields.entries()) {
      await inputs[index].vm.$emit('update:modelValue', `next-${field.key}`);
      expect(store.crosstabForm[field.key]).toBe(`next-${field.key}`);
    }

    expect(store.crosstabForm.widget_uuid).toBe('uuid-1');
  });

  it('resets the crosstab form when the component is unmounted', () => {
    const pinia = createPinia(filledForm());
    const wrapper = mountForm(pinia);

    wrapper.unmount();

    expect(useCustomWidgets().crosstabForm).toEqual(emptyForm());
  });
});
