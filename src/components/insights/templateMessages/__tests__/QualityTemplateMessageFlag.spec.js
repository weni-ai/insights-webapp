import { beforeEach, describe } from 'vitest';
import { mount } from '@vue/test-utils';

import QualityTemplateMessageFlag from '../QualityTemplateMessageFlag.vue';

describe('QualityTemplateMessageFlag', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(QualityTemplateMessageFlag, {});
  });

  it('renders correctly template status', async () => {
    await wrapper.setProps({ status: 'APPROVED' });
    expect(wrapper.classes()).toContain(
      'quality-template-message-flag--approved',
    );
  });
});
