import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import FormAccordion from '@/components/FormAccordion.vue';

describe('FormAccordion.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(FormAccordion, {
      props,
      global: {
        stubs: {
          UnnnicCollapse: true,
          UnnnicIcon: true,
        },
      },
      slots: {
        content: '<div class="slot-content">Slot Content</div>',
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Props', () => {
    it('should render title text', () => {
      wrapper = createWrapper({ title: 'Test Title' });
      const header = wrapper.find('.form-accordion__header');

      expect(header.text()).toContain('Test Title');
    });

    it('should apply active and highlighted classes when active and highlighted are true', () => {
      wrapper = createWrapper({ active: true, highlighted: true });
      expect(wrapper.find('.form-accordion').classes()).toContain(
        'form-accordion--active',
      );
      expect(wrapper.find('.form-accordion').classes()).toContain(
        'highlighted',
      );
    });

    it('should not apply active or highlighted classes when props are false', () => {
      wrapper = createWrapper({ active: false, highlighted: false });
      expect(wrapper.find('.form-accordion').classes()).not.toContain(
        'form-accordion--active',
      );
      expect(wrapper.find('.form-accordion').classes()).not.toContain(
        'highlighted',
      );
    });
  });

  describe('Computed Properties', () => {
    it('iconScheme should return "weni-600" if validConfig is true', () => {
      wrapper = createWrapper({ validConfig: true });
      expect(wrapper.vm.iconScheme).toBe('weni-600');
    });

    it('iconScheme should return "neutral-soft" if validConfig is false', () => {
      wrapper = createWrapper({ validConfig: false });
      expect(wrapper.vm.iconScheme).toBe('neutral-soft');
    });
  });

  describe('Emits', () => {
    it('should emit update:active event with new value when change event is triggered on UnnnicCollapse', async () => {
      const collapseComponent = wrapper.findComponent(
        '[data-test-id="form-accordion"]',
      );
      await collapseComponent.vm.$emit('change', true);

      expect(wrapper.emitted('update:active')).toBeTruthy();
      expect(wrapper.emitted('update:active')[0]).toEqual([true]);
    });
  });

  describe('Slots', () => {
    it('should render slot content in the content slot', () => {
      expect(wrapper.find('.slot-content').exists()).toBe(true);
      expect(wrapper.find('.slot-content').text()).toBe('Slot Content');
    });
  });

  describe('Icon', () => {
    it('should render UnnnicIcon with correct icon, scheme, size, and filled attributes', () => {
      wrapper = createWrapper({ validConfig: true });
      const icon = wrapper.findComponent('[data-test-id="check_circle"]');

      expect(icon.exists()).toBe(true);
      expect(icon.props('icon')).toBe('check_circle');
      expect(icon.props('scheme')).toBe('weni-600');
      expect(icon.props('size')).toBe('avatar-nano');
      expect(icon.props('filled')).toBe(true);
    });
  });

  it('should match the snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
