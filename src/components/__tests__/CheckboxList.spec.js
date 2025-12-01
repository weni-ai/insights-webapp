import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import CheckboxList from '@/components/CheckboxList.vue';

const checkboxesMock = [
  { value: 'check1', label: 'Check 1', disabled: true, selected: false },
  { value: 'check2', label: 'Check 2', selected: false },
  { value: 'check3', label: 'Check 3', selected: true },
];

const createWrapper = (props) => {
  return mount(CheckboxList, { props });
};

describe('CheckboxList', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = createWrapper({
      label: 'Label',
      checkboxes: checkboxesMock,
    });
  });
  it('should render label and list', async () => {
    const label = wrapper.find('[data-testid="checkbox-list-label"]');
    expect(label.exists()).toBe(true);

    const checkboxes = wrapper.findAllComponents('[data-testid="checkbox"]');
    expect(checkboxes.length).toBe(checkboxesMock.length);

    expect(wrapper.element).toMatchSnapshot();
  });
  it('should emit click events', async () => {
    const checkboxes = wrapper.findAllComponents('[data-testid="checkbox"]');

    // Verify disabled checkbox
    expect(checkboxes[0].props('disabled')).toBe(true);

    // Update checkbox value to true (index 1 is not disabled)
    await checkboxes[1].vm.$emit('change', true);
    let clickEventData = wrapper.emitted('update:checkboxes')[0][0];
    expect(clickEventData).toBeTruthy();
    expect(clickEventData[1].selected).toBe(true);

    // Update checkbox value to false (index 2 starts as true)
    await checkboxes[2].vm.$emit('change', false);
    clickEventData = wrapper.emitted('update:checkboxes')[1][0];
    expect(clickEventData).toBeTruthy();
    expect(clickEventData[2].selected).toBe(false);
  });
});
