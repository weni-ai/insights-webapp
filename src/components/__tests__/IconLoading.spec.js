import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import IconLoading from '@/components/IconLoading.vue';

describe('IconLoading', () => {
  it('should render the UnnnicIconLoading component', () => {
    const wrapper = mount(IconLoading, {
      global: { stubs: { UnnnicIconLoading: true } },
    });
    expect(wrapper.findComponent('[data-testid="icon-loading"]').exists()).toBe(
      true,
    );
  });
});
