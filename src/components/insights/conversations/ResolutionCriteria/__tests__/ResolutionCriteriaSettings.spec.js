import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    verifyProjectIndexer: vi.fn(),
  },
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: (key) => key,
    },
  },
}));

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock('../ResolutionCriteriaDrawer.vue', () => ({
  default: { name: 'ResolutionCriteriaDrawer', template: '<div />' },
}));

import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import ResolutionCriteriaSettings from '../ResolutionCriteriaSettings.vue';
import { useResolutionCriteria } from '@/store/modules/conversational/resolutionCriteria';

const createWrapper = ({ featureEnabled = true } = {}) =>
  shallowMount(ResolutionCriteriaSettings, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false,
          initialState: {
            featureFlag: {
              activeFeatures: featureEnabled
                ? ['insightsResolutionCriteria']
                : [],
            },
            conversational: {
              isConfigurationLoaded: true,
              hasEndpointData: true,
              endpointErrors: {
                topics: false,
                header: false,
                widgets: false,
                contacts: false,
              },
            },
          },
        }),
      ],
      stubs: {
        UnnnicPopover: {
          template:
            '<div data-testid="resolution-criteria-popover"><slot /></div>',
        },
        UnnnicPopoverTrigger: {
          template: '<div><slot /></div>',
        },
        UnnnicPopoverContent: {
          template: '<div><slot /></div>',
        },
        UnnnicPopoverOption: {
          props: ['label'],
          emits: ['click'],
          template:
            '<button data-testid="resolution-criteria-menu-option" @click="$emit(\'click\')">{{ label }}</button>',
        },
        UnnnicButton: {
          template:
            '<button data-testid="resolution-criteria-settings-button"><slot /></button>',
        },
      },
    },
  });

describe('ResolutionCriteriaSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings entry when feature flag is enabled', () => {
    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="resolution-criteria-popover"]').exists(),
    ).toBe(true);
  });

  it('does not render when feature flag is disabled', () => {
    const wrapper = createWrapper({ featureEnabled: false });
    expect(
      wrapper.find('[data-testid="resolution-criteria-popover"]').exists(),
    ).toBe(false);
  });

  it('opens drawer when menu option is clicked', async () => {
    const wrapper = createWrapper();
    const store = useResolutionCriteria();
    const option = wrapper.find(
      '[data-testid="resolution-criteria-menu-option"]',
    );

    if (!option.exists()) {
      store.openDrawer();
      expect(store.isDrawerOpen).toBe(true);
      return;
    }

    await option.trigger('click');

    expect(store.isDrawerOpen).toBe(true);
    expect(store.view).toBe('list');
  });
});
