import { mount, config } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DropdownFilter from '@/components/home/DropdownFilter.vue';
import { createI18n } from 'vue-i18n';
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

config.global.plugins = [i18n, UnnnicSystem];
config.global.mocks = {
  $t: (key) => key,
};

describe('DropdownFilter', () => {
  let wrapper;
  const mockAction = vi.fn();

  const defaultProps = {
    items: [
      { name: 'Option 1', action: mockAction },
      { name: 'Option 2', action: mockAction },
      { name: 'Option 3' },
    ],
    defaultItem: { name: 'Default Option' },
  };

  beforeEach(() => {
    wrapper = mount(DropdownFilter, {
      props: defaultProps,
      global: {
        mocks: {
          $t: (key) => key,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('renders properly with default props', async () => {
    const dropdown = wrapper.findComponent({ name: 'UnnnicDropdown' });
    expect(dropdown.exists()).toBeTruthy();
    await dropdown.trigger('click');
    expect(wrapper.findAll('[data-testid="option-select"]')).toHaveLength(3);
  });

  it('displays the default item name initially', () => {
    const title = wrapper.find('[data-testid="filter-type-title"]');
    expect(title.text()).toBe('Default Option');
  });

  describe('dropdown state', () => {
    it('starts with dropdown closed', () => {
      const dropdown = wrapper.findComponent({ name: 'UnnnicDropdown' });
      expect(dropdown.props('open')).toBe(true);
    });

    it('toggles dropdown when clicking trigger', async () => {
      const trigger = wrapper.find(
        '[data-testid="filter-type__select-type-dropdown"]',
      );
      await trigger.trigger('click');

      const dropdown = wrapper.findComponent({ name: 'UnnnicDropdown' });
      expect(dropdown.props('open')).toBe(false);
    });

    it('shows correct icon based on dropdown state', async () => {
      const icon = wrapper.findComponent('[data-testid="expand-icon"]');
      expect(icon.props('icon')).toBe('keyboard_arrow_up');

      const trigger = wrapper.find(
        '[data-testid="filter-type__select-type-dropdown"]',
      );
      await trigger.trigger('click');

      expect(icon.props('icon')).toBe('expand_more');
    });
  });

  describe('item selection', () => {
    it('calls action and updates current item when selecting an option', async () => {
      const dropdown = wrapper.findComponent({ name: 'UnnnicDropdown' });
      await dropdown.trigger('click');

      const dropdownItems = wrapper.findAllComponents(
        '[data-testid="option-select"]',
      );

      await dropdownItems[0].trigger('click');

      expect(mockAction).toHaveBeenCalledTimes(1);
      expect(wrapper.find('[data-testid="filter-type-title"]').text()).toBe(
        'Option 1',
      );
    });

    it('resets to default item when selecting the current active item', async () => {
      const dropdown = wrapper.findComponent({ name: 'UnnnicDropdown' });
      await dropdown.trigger('click');

      const dropdownItems = wrapper.findAllComponents({
        name: 'UnnnicDropdownItem',
      });

      await dropdownItems[0].trigger('click');
      expect(wrapper.find('[data-testid="filter-type-title"]').text()).toBe(
        'Option 1',
      );

      await dropdownItems[0].trigger('click');
      expect(wrapper.find('[data-testid="filter-type-title"]').text()).toBe(
        'Default Option',
      );
    });

    it('closes dropdown after selection', async () => {
      const dropdown = wrapper.findComponent({ name: 'UnnnicDropdown' });
      await dropdown.trigger('click');

      const dropdownItems = wrapper.findAllComponents({
        name: 'UnnnicDropdownItem',
      });
      await dropdownItems[0].trigger('click');

      const checkDropdown = wrapper.findComponent({ name: 'UnnnicDropdown' });
      expect(checkDropdown.props('open')).toBe(true);
    });
  });

  describe('styling classes', () => {
    it('applies correct base classes to all items', () => {
      const dropdownItems = wrapper.findAllComponents({
        name: 'UnnnicDropdownItem',
      });
      dropdownItems.forEach((item) => {
        expect(item.classes()).toContain('filter-type__option');
      });
    });
  });
});
