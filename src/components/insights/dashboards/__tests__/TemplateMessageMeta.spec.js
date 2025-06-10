import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { mount, config, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import TemplateMessageMeta from '../TemplateMessageMeta.vue';
import MetaTemplateMessageService from '@/services/api/resources/template/metaTemplateMessage';

import { useDashboards } from '@/store/modules/dashboards';
import { useConfig } from '@/store/modules/config';
import { useMetaTemplateMessage } from '@/store/modules/templates/metaTemplateMessage';

import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

vi.mock('@/services/api/resources/template/metaTemplateMessage', () => ({
  default: {
    listTemplates: vi.fn(),
    getTemplatePreview: vi.fn(),
    getTemplateButtonsAnalytics: vi.fn(),
    getTemplateMessagesAnalytics: vi.fn(),
    favoriteTemplate: vi.fn(),
    unfavoriteTemplate: vi.fn(),
  },
}));

describe('TemplateMessageMeta', () => {
  let wrapper;
  let dashboardsStore;
  let configStore;
  let metaTemplateMessageStore;
  let mockLocalStorage;
  let pinia;

  const mockTemplateData = {
    id: 'template-123',
    name: 'Test Template',
    status: 'APPROVED',
  };

  const mockTemplatePreview = {
    title: 'Test Title',
    text: 'Test Text',
    name: 'Test Template',
    status: 'APPROVED',
    is_favorite: false,
    buttons: [],
  };

  const mockMessagesAnalytics = {
    status_count: {
      sent: { value: 100 },
      delivered: { value: 90, percentage: 90 },
      read: { value: 80, percentage: 80 },
      clicked: { value: 10, percentage: 10 },
    },
    data_points: [
      { date: '2024-01-01', sent: 50, delivered: 45, read: 40, clicked: 5 },
      { date: '2024-01-02', sent: 50, delivered: 45, read: 40, clicked: 5 },
    ],
  };

  const mockButtonsAnalytics = [
    {
      label: 'Button 1',
      type: 'URL',
      total: 20,
      click_rate: 0.2,
    },
    {
      label: 'Button 2',
      type: 'PHONE_NUMBER',
      total: 15,
      click_rate: 0.15,
    },
  ];

  const createWrapper = (options = {}) => {
    return mount(TemplateMessageMeta, {
      global: {
        plugins: [UnnnicSystem, pinia],
        mocks: {
          $t: (key) => key,
        },
      },
      ...options,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    pinia = createTestingPinia({
      createSpy: vi.fn,
    });

    mockLocalStorage = {
      'meta-last-templates-viewed': '{}',
    };

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => mockLocalStorage[key]),
        setItem: vi.fn((key, value) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    MetaTemplateMessageService.listTemplates.mockResolvedValue({
      results: [mockTemplateData],
    });
    MetaTemplateMessageService.getTemplatePreview.mockResolvedValue(
      mockTemplatePreview,
    );
    MetaTemplateMessageService.getTemplateMessagesAnalytics.mockResolvedValue(
      mockMessagesAnalytics,
    );
    MetaTemplateMessageService.getTemplateButtonsAnalytics.mockResolvedValue(
      mockButtonsAnalytics,
    );
    MetaTemplateMessageService.favoriteTemplate.mockResolvedValue({});
    MetaTemplateMessageService.unfavoriteTemplate.mockResolvedValue({});

    wrapper = createWrapper();

    dashboardsStore = useDashboards();
    configStore = useConfig();
    metaTemplateMessageStore = useMetaTemplateMessage();

    dashboardsStore.currentDashboard = {
      uuid: 'dashboard-uuid',
      config: { waba_id: 'waba-123' },
    };

    dashboardsStore.appliedFilters = {
      date: { _start: '2024-01-01', _end: '2024-01-31' },
    };

    configStore.project = { uuid: 'project-123' };

    metaTemplateMessageStore.selectedTemplateUuid = '';
    metaTemplateMessageStore.emptyTemplates = false;
    metaTemplateMessageStore.favoritesTemplates = [];
    metaTemplateMessageStore.selectedFavoriteTemplate = [{ value: '' }];
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  it('should render loading state initially', async () => {
    wrapper = createWrapper();

    wrapper.vm.initialLoading = true;
    await nextTick();

    const loadingSection = wrapper.find(
      '[data-testid="template-message-meta-dashboard-loading"]',
    );
    expect(loadingSection.exists()).toBe(true);
  });

  it('should call listTemplates on mount when no last viewed template', async () => {
    wrapper = createWrapper();

    dashboardsStore.currentDashboard = {
      uuid: 'dashboard-uuid',
      config: { waba_id: 'waba-123' },
    };

    await flushPromises();

    expect(MetaTemplateMessageService.listTemplates).toHaveBeenCalledWith({
      limit: 1,
      waba_id: 'waba-123',
      project_uuid: 'project-123',
    });
  });

  it('should call getTemplatePreview on mount when last viewed template is not empty', async () => {
    const initialValue = { 'dashboard-uuid': '123' };

    localStorage.setItem(
      'meta-last-templates-viewed',
      JSON.stringify(initialValue),
    );

    const handlerSelectedTemplateUuidSpy = vi.spyOn(
      metaTemplateMessageStore,
      'setSelectedTemplateUuid',
    );

    wrapper = createWrapper();
    await flushPromises();

    expect(handlerSelectedTemplateUuidSpy).toHaveBeenCalledWith('123');
  });

  it('should handle useLocalStorage for meta-last-templates-viewed', async () => {
    // Set initial value in localStorage
    const initialValue = { templateId: 'test-123' };

    localStorage.setItem(
      'meta-last-templates-viewed',
      JSON.stringify(initialValue),
    );

    wrapper = createWrapper();
    await flushPromises();

    // Verify the component can read the value
    expect(wrapper.vm.lastOpenTemplates).toEqual(initialValue);

    // Update the value
    const newValue = { templateId: 'new-123' };
    wrapper.vm.lastOpenTemplates = newValue;
    await nextTick();

    // Verify the value was updated in localStorage
    expect(
      JSON.parse(localStorage.getItem('meta-last-templates-viewed')),
    ).toEqual(newValue);
  });
});
