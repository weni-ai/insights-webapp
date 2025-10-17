import { beforeEach, describe, expect, it } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import ExportCheckboxs from '../ExportCheckboxs.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      export_data: {
        model_labels: {
          user: 'User',
          contact: 'Contact',
        },
        field_labels: {
          email: 'Email',
          name: 'Name',
          phone: 'Phone',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('ExportCheckboxs', () => {
  let wrapper;

  const mockModelFields = {
    user: {
      email: { type: 'string' },
      name: { type: 'string' },
    },
    contact: {
      phone: { type: 'string' },
      name: { type: 'string' },
    },
  };

  const defaultProps = {
    modelFields: mockModelFields,
    selectedFields: { user: ['email'] },
    enabledModels: ['user'],
    modelFilters: [],
    isLoading: false,
  };

  const createWrapper = (props = {}) => {
    return mount(ExportCheckboxs, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          UnnnicCheckbox: true,
          UnnnicSkeletonLoading: true,
        },
      },
    });
  };

  const section = () => wrapper.find('.form-checkboxs-data');

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render models section', () => {
      const modelsSection = wrapper.find('.form-checkboxs-data__models');
      expect(modelsSection.exists()).toBe(true);
    });

    it('should render loading skeletons when isLoading is true', () => {
      wrapper = createWrapper({ isLoading: true });
      const loadingSection = wrapper.find('.form-checkboxs-data__loading');
      expect(loadingSection.exists()).toBe(true);
    });

    it('should not render loading when isLoading is false', () => {
      const loadingSection = wrapper.find('.form-checkboxs-data__loading');
      expect(loadingSection.exists()).toBe(false);
    });
  });

  describe('Props', () => {
    it('should use default values', () => {
      wrapper = createWrapper({
        modelFields: undefined,
        selectedFields: undefined,
        enabledModels: undefined,
        modelFilters: undefined,
        isLoading: undefined,
      });

      expect(wrapper.props('modelFields')).toEqual({});
      expect(wrapper.props('selectedFields')).toEqual({});
      expect(wrapper.props('enabledModels')).toEqual([]);
      expect(wrapper.props('modelFilters')).toEqual([]);
      expect(wrapper.props('isLoading')).toBe(false);
    });

    it('should accept complex model fields structure', () => {
      expect(wrapper.props('modelFields')).toEqual(mockModelFields);
    });
  });

  describe('Model helpers', () => {
    it('should check if model is enabled', () => {
      expect(wrapper.vm.isModelEnabled('user')).toBe(true);
      expect(wrapper.vm.isModelEnabled('contact')).toBe(false);
    });

    it('should get model fields list', () => {
      const fields = wrapper.vm.getModelFieldsList('user');
      expect(fields).toHaveLength(2);
      expect(fields[0]).toEqual({ name: 'email', type: 'string' });
    });

    it('should return empty array for non-existent model', () => {
      const fields = wrapper.vm.getModelFieldsList('nonexistent');
      expect(fields).toEqual([]);
    });

    it('should check if field is selected', () => {
      expect(wrapper.vm.isFieldSelected('user', 'email')).toBe(true);
      expect(wrapper.vm.isFieldSelected('user', 'name')).toBe(false);
    });

    it('should return false for non-existent model in field selection', () => {
      expect(wrapper.vm.isFieldSelected('nonexistent', 'field')).toBe(false);
    });
  });

  describe('Model filtering', () => {
    it('should render model when no filter is configured', () => {
      expect(wrapper.vm.shouldRenderModel('user')).toBe(true);
    });

    it('should render model when filter has data', () => {
      wrapper = createWrapper({
        modelFilters: [
          {
            modelName: 'user',
            filterData: [{ value: '1', label: 'Option 1' }],
          },
        ],
      });
      expect(wrapper.vm.shouldRenderModel('user')).toBe(true);
    });

    it('should not render model when filter is empty', () => {
      wrapper = createWrapper({
        modelFilters: [{ modelName: 'user', filterData: [] }],
      });
      expect(wrapper.vm.shouldRenderModel('user')).toBe(false);
    });
  });

  describe('Label formatting', () => {
    it('should return translated model label', () => {
      expect(wrapper.vm.getModelLabel('user')).toBe('User');
    });

    it('should format model name when translation is missing', () => {
      expect(wrapper.vm.getModelLabel('user_profile')).toBe('User Profile');
    });

    it('should return translated field label', () => {
      expect(wrapper.vm.getFieldLabel('email')).toBe('Email');
    });

    it('should format field name when translation is missing', () => {
      expect(wrapper.vm.getFieldLabel('first_name')).toBe('First Name');
    });

    it('should capitalize first letter of each word', () => {
      expect(wrapper.vm.getFieldLabel('contact_phone_number')).toBe(
        'Contact Phone Number',
      );
    });
  });

  describe('Events', () => {
    it('should emit model-toggle event', async () => {
      await wrapper.vm.handleModelToggle('contact', true);

      expect(wrapper.emitted('model-toggle')).toBeTruthy();
      expect(wrapper.emitted('model-toggle')[0]).toEqual(['contact', true]);
    });

    it('should emit field-toggle event', async () => {
      await wrapper.vm.handleFieldToggle('user', 'name', true);

      expect(wrapper.emitted('field-toggle')).toBeTruthy();
      expect(wrapper.emitted('field-toggle')[0]).toEqual([
        'user',
        'name',
        true,
      ]);
    });

    it('should handle multiple toggle events', async () => {
      await wrapper.vm.handleModelToggle('user', false);
      await wrapper.vm.handleModelToggle('contact', true);

      expect(wrapper.emitted('model-toggle')).toHaveLength(2);
    });
  });

  describe('Conditional rendering', () => {
    it('should render fields when model is enabled', () => {
      wrapper = createWrapper({
        enabledModels: ['user'],
        selectedFields: { user: ['email'] },
      });

      const modelSection = wrapper.find('.form-checkboxs-data__model');
      expect(modelSection.exists()).toBe(true);
    });

    it('should handle empty model fields', () => {
      wrapper = createWrapper({
        modelFields: { empty_model: {} },
        enabledModels: ['empty_model'],
      });

      expect(wrapper.vm.getModelFieldsList('empty_model')).toEqual([]);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('form-checkboxs-data');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
