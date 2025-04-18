import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DrawerConfigGallery from '../index.vue';
import GalleryOption from '../GalleryOption.vue';
import DrawerConfigWidgetDynamic from '../../DrawerConfigWidgetDynamic.vue';
import DrawerConfigContentVtexConversions from '../../DrawerConfigContentVtexConversions.vue';
import { createStore } from 'vuex';

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
    store = createStore({
      modules: {
        config: {
          namespaced: true,
          state: () => ({
            project: {
              uuid: '95fa43d6-d91a-48d4-bbe8-256d93bf5254',
            },
          }),
        },
        project: {
          namespaced: true,
          state: () => ({
            isLoadedFlows: true,
            flows: [],
          }),
          actions: {
            getProjectFlows: vi.fn(),
          },
        },
        widgets: {
          namespaced: true,
          state: () => ({ currentWidgetEditing: mockWidget }),
          actions: {
            updateCurrentWidgetEditing: vi.fn(),
          },
        },
        onboarding: {
          namespaced: true,
          state: () => ({
            onboardingRefs: {},
            showConfigWidgetOnboarding: false,
          }),
          actions: {
            callTourNextStep: vi.fn(),
            callTourPreviousStep: vi.fn(),
          },
          mutations: {
            SET_ONBOARDING_REF: vi.fn(),
          },
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
    store.state.config.project.uuid = '123';
    await wrapper.vm.$nextTick();
    const options = wrapper.findAllComponents('[data-testid="gallery-option"]');
    expect(options.length).toBe(2);

    expect(options[0].text()).toContain('Funnel');
    expect(options[1].text()).toContain('Recurrence');
  });

  it('renders UnnnicDrawer with gallery options with vtex', async () => {
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
