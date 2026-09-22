import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';

import HeaderTagLive from '../HeaderTagLive.vue';

const currentDashboardRef = ref({ name: 'other_dashboard' });

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: () => ({ $id: 'dashboards' }),
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => {
      if (store?.$id === 'dashboards') {
        return { currentDashboard: currentDashboardRef };
      }
      return actual.storeToRefs(store);
    },
  };
});

const createWrapper = () =>
  mount(HeaderTagLive, {
    global: {
      plugins: [createTestingPinia()],
      stubs: {
        UnnnicIcon: {
          name: 'UnnnicIcon',
          template: '<span class="icon-stub" />',
        },
      },
    },
  });

describe('HeaderTagLive.vue', () => {
  beforeEach(() => {
    currentDashboardRef.value = { name: 'other_dashboard' };
  });

  it('shows today text for non human support dashboards', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.header-tag-live__text').text()).toBeTruthy();
    expect(wrapper.vm.titleText).toBe(wrapper.vm.$t('today'));
  });

  it('shows now text for human support dashboard', () => {
    currentDashboardRef.value = { name: 'human_support_dashboard.title' };
    const wrapper = createWrapper();
    expect(wrapper.vm.titleText).toBe(wrapper.vm.$t('now'));
  });
});
