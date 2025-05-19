import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createTestingPinia } from '@pinia/testing';
import { useConfig } from '@/store/modules/config';

import DrawerConfigGallery from '../index.vue';
import GalleryOption from '../GalleryOption.vue';
import DrawerConfigWidgetDynamic from '../../DrawerConfigWidgetDynamic.vue';
import DrawerConfigContentVtexConversions from '../../DrawerConfigContentVtexConversions.vue';

vi.mock('@/utils/env', () => ({
  default: vi.fn(() => 'staging'),
}));

vi.mock('@/services/api/resources/projects', () => ({
  default: { getProjectSource: vi.fn().mockResolvedValue([]) },
}));

const mockWidget = {
  type: 'empty_column',
  config: {},
};

describe('DrawerConfigGallery.vue', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = createTestingPinia({
      initialState: {
        config: {
          project: {
            uuid: '95fa43d6-d91a-48d4-bbe8-256d93bf5254',
          },
        },
        project: {
          isLoadedFlows: true,
          flows: [],
          getProjectFlows: vi.fn(),
        },
        widgets: {
          currentWidgetEditing: mockWidget,
          updateCurrentWidgetEditing: vi.fn(),
        },
        onboarding: {
          onboardingRefs: {},
          showConfigWidgetOnboarding: false,
        },
      },
    });
    wrapper = mount(DrawerConfigGallery, {
      global: {
        plugins: [store],
        components: { GalleryOption, DrawerConfigWidgetDynamic },
        stubs: { DrawerConfigContentVtexConversions: true },
      },
      props: {
        modelValue: true,
      },
    });
  });

  it('renders UnnnicDrawer with gallery options withou vtex', async () => {
    const configStore = useConfig();
    configStore.project.uuid = 123;

    await wrapper.vm.$nextTick();
    const options = wrapper.findAllComponents('[data-testid="gallery-option"]');
    expect(options.length).toBe(2);

    expect(options[0].text()).toContain('Funnel');
    expect(options[1].text()).toContain('Recurrence');
  });

  it('renders UnnnicDrawer with gallery options with vtex when UUID is in the list', async () => {
    store.state.project.isCommerce = false;
    store.state.config.project.uuid = '95fa43d6-d91a-48d4-bbe8-256d93bf5254';
    await wrapper.vm.$nextTick();

    const options = wrapper.findAllComponents('[data-testid="gallery-option"]');
    expect(options.length).toBe(4);

    expect(options[0].text()).toContain('Funnel');
    expect(options[1].text()).toContain('Recurrence');
    expect(options[2].text()).toContain('VTEX');
    expect(options[3].text()).toContain('Template conversion');
  });

  it('renders UnnnicDrawer with gallery options with vtex when isCommerce is true regardless of UUID', async () => {
    store.state.config.project.uuid = '123';
    store.state.project.isCommerce = true;
    await wrapper.vm.$nextTick();

    const options = wrapper.findAllComponents('[data-testid="gallery-option"]');
    expect(options.length).toBe(4);

    expect(options[0].text()).toContain('Funnel');
    expect(options[1].text()).toContain('Recurrence');
    expect(options[2].text()).toContain('VTEX');
    expect(options[3].text()).toContain('Template conversion');
  });

  it('renders DrawerConfigWidgetDynamic when showDrawerConfigWidget is true', async () => {
    await wrapper.setData({
      showDrawerConfigWidget: true,
      drawerConfigType: 'funnel',
    });

    await wrapper.vm.$nextTick();

    const drawerConfigWidgetDynamic = wrapper.findComponent(
      DrawerConfigWidgetDynamic,
    );

    expect(drawerConfigWidgetDynamic.exists()).toBe(true);
    expect(drawerConfigWidgetDynamic.props().configType).toBe('funnel');
  });

  it('calls closeAllDrawers and emits close on UnnnicDrawer close', async () => {
    await wrapper.vm.closeAllDrawers();

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('calls setDrawerConfigType when GalleryOption is clicked', async () => {
    const spySetDrawerConfigType = vi.spyOn(wrapper.vm, 'setDrawerConfigType');
    const option = wrapper.findComponent('[data-testid="gallery-option"]');
    await option.trigger('click');
    expect(spySetDrawerConfigType).toHaveBeenCalled();
    expect(spySetDrawerConfigType).toHaveBeenCalledWith('funnel');
  });

  it('should open vtex conversions form when click gallery options', async () => {
    wrapper.vm.handleShowDrawerConfigWidget = () => {
      wrapper.vm.showDrawerConfigWidget = true;
    };
    const spySetDrawerConfigType = vi.spyOn(wrapper.vm, 'setDrawerConfigType');
    const options = wrapper.findAllComponents('[data-testid="gallery-option"]');

    await options[3].trigger('click');

    expect(spySetDrawerConfigType).toHaveBeenCalled();
    expect(spySetDrawerConfigType).toHaveBeenCalledWith('vtex_conversions');

    await flushPromises();

    const drawerConfigWidgetDynamic = wrapper.findComponent(
      DrawerConfigWidgetDynamic,
    );

    expect(drawerConfigWidgetDynamic.exists()).toBe(true);

    const vtexConversionsForm = wrapper.findComponent(
      DrawerConfigContentVtexConversions,
    );

    expect(vtexConversionsForm.exists()).toBe(true);
  });
});
