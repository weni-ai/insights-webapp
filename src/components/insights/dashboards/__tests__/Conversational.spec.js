import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { shallowMount, config } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import Conversational from '../Conversational.vue';
import { createI18n } from 'vue-i18n';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useWidgets } from '@/store/modules/widgets';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

vi.mock('@/store/modules/conversational/widgets');
vi.mock('@/store/modules/widgets');

describe('Conversational.vue', () => {
  let wrapper;
  let conversationalWidgetsStore;
  let widgetsStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    conversationalWidgetsStore = {
      isCsatConfigured: ref(false),
      isNpsConfigured: ref(false),
      getDynamicWidgets: ref([]),
    };
    useConversationalWidgets.mockReturnValue(conversationalWidgetsStore);

    widgetsStore = {
      isLoadingCurrentDashboardWidgets: ref(false),
    };
    useWidgets.mockReturnValue(widgetsStore);

    wrapper = shallowMount(Conversational, {
      global: {
        stubs: {
          DashboardHeader: true,
          MostTalkedAboutTopicsWidget: true,
          ConversationalDynamicWidget: true,
          CsatOrNpsDrawer: true,
        },
      },
    });
  });

  it('should show csat and add widgets when only csat is configured and widgets are less than 2', async () => {
    conversationalWidgetsStore.isCsatConfigured.value = true;
    conversationalWidgetsStore.getDynamicWidgets.value = [];
    await nextTick();
    expect(wrapper.vm.orderedDynamicWidgets).toEqual(['csat', 'add']);
  });

  it('should show nps and add widgets when only nps is configured and widgets are less than 2', async () => {
    conversationalWidgetsStore.isNpsConfigured.value = true;
    conversationalWidgetsStore.getDynamicWidgets.value = [];
    await nextTick();
    expect(wrapper.vm.orderedDynamicWidgets).toEqual(['nps', 'add']);
  });

  it('should show csat and nps widgets when both are configured', async () => {
    conversationalWidgetsStore.isCsatConfigured.value = true;
    conversationalWidgetsStore.isNpsConfigured.value = true;
    conversationalWidgetsStore.getDynamicWidgets.value = ['csat', 'nps'];
    await nextTick();
    expect(wrapper.vm.orderedDynamicWidgets).toEqual(['csat', 'nps']);
  });

  it('should show only add widget when no dynamic widgets are configured', async () => {
    await nextTick();
    expect(wrapper.vm.orderedDynamicWidgets).toEqual(['add']);
  });

  it('should maintain csat first, then nps order when both are present', async () => {
    conversationalWidgetsStore.isCsatConfigured.value = true;
    conversationalWidgetsStore.isNpsConfigured.value = true;
    conversationalWidgetsStore.getDynamicWidgets.value = ['csat', 'nps'];
    await nextTick();
    expect(wrapper.vm.orderedDynamicWidgets).toEqual(['csat', 'nps']);

    // This also tests the order from the `orderedDynamicWidgets` computed
    // as it will re-order them regardless of the order in `dynamicWidgets`
    // for which we don't have direct control in the test anyway.
  });

  it('should show no dynamic widgets when loading', async () => {
    widgetsStore.isLoadingCurrentDashboardWidgets.value = true;
    await nextTick();
    expect(wrapper.vm.orderedDynamicWidgets).toEqual([]);
  });
});
