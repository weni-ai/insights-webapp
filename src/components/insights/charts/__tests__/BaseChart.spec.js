import { mount } from '@vue/test-utils';
import { describe } from 'vitest';

import BaseChart from '../BaseChart.vue';

describe('BaseChart', () => {
  it('Should match the snapshot', () => {
    const wrapper = mount(BaseChart);
    expect(wrapper.element).toMatchSnapshot();
  });
});
