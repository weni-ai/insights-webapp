import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

import RadioList from '@/components/RadioList.vue';

describe('RadioList.vue', () => {
  const radios = [
    { value: 'option1', label: 'Option 1', tooltip: 'Tooltip option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];
  let wrapper;

  beforeEach(() => {
    wrapper = mount(RadioList, {
      props: { radios },
    });
  });

  it('renders the radio buttons correctly', () => {
    radios.forEach((radio) => {
      const radioElement = wrapper.get(`[data-testid=radio-${radio.value}]`);
      expect(radioElement.text()).toContain(radio.label);
    });
  });

  it('renders the label if provided', async () => {
    await wrapper.setProps({ label: 'Test Label' });
    const radioListLabel = wrapper.get('[data-testid=radio-list-label]');
    expect(radioListLabel.exists()).toBe(true);
  });

  it('does not render the label if not provided', () => {
    const wrapper = mount(RadioList, {
      props: { radios },
    });

    const radioListLabel = wrapper.find('[data-testid=radio-list-label]');

    expect(radioListLabel.exists()).toBe(false);
  });

  it('emits update:selected-radio event when a radio is clicked', async () => {
    const radio1 = wrapper.findComponent('[data-testid=radio-option1]');
    await radio1.vm.$emit('update:model-value', 'option1');

    expect(wrapper.emitted('update:selected-radio')).toBeTruthy();
    expect(wrapper.emitted('update:selected-radio')[0]).toEqual(['option1']);
  });

  it('applies the correct class when wrap is true', () => {
    const wrapper = mount(RadioList, {
      props: { radios, wrap: true },
    });

    expect(wrapper.find('.radio-list').classes()).toContain(
      'radio-list--wrap-radios',
    );
  });

  it('does not apply the wrap class when wrap is false', () => {
    const wrapper = mount(RadioList, {
      props: { radios, wrap: false },
    });

    expect(wrapper.find('.radio-list').classes()).not.toContain(
      'radio-list--wrap-radios',
    );
  });

  it('should show tooltip if radio item have it key', () => {
    const tooltipOption1 = wrapper.find('[data-testid=radio-option1-tooltip]');

    expect(tooltipOption1.exists()).toBeTruthy();
    expect(wrapper.text()).toContain(radios[0].tooltip);
  });
});
