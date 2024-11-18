import { beforeEach, describe, expect, it } from 'vitest';
import { mount, config } from '@vue/test-utils';
import CompleteOnboardingModal from '@/components/CompleteOnboardingModal.vue';
import i18n from '@/utils/plugins/i18n';

beforeAll(() => {
  config.global.plugins = config.global.plugins.filter(
    (plugin) => plugin !== i18n,
  );
});

afterAll(() => {
  if (!config.global.plugins.includes(i18n)) {
    config.global.plugins.push(i18n);
  }
});

describe('CompleteOnboardingModal', () => {
  let wrapper;

  const createWrapper = (props) => {
    return mount(CompleteOnboardingModal, {
      props,
      global: {
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          UnnnicModalDialog: {
            template: '<div><slot /><slot name="primary-button"></slot></div>',
          },
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper({ showModal: true });
  });

  describe('Props', () => {
    it('should receive showModal as true', () => {
      expect(wrapper.props('showModal')).toBe(true);
    });

    it('should pass showModal prop to UnnnicModalDialog', () => {
      const modalDialog = wrapper.findComponent(
        '[data-test-id="modal-dialog"]',
      );

      expect(modalDialog.attributes('modelvalue')).toBe('true');
    });
  });

  describe('Rendering Content', () => {
    it('should display the modal title from translation', () => {
      const title = wrapper.find('.finish-onboarding-modal__content__title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe(
        wrapper.vm.$t('onboarding.complete_modal.title'),
      );
    });

    it('should display the modal info text from translation', () => {
      const info = wrapper.find('.finish-onboarding-modal__content__info');
      expect(info.exists()).toBe(true);
      expect(info.text()).toBe(wrapper.vm.$t('onboarding.complete_modal.text'));
    });
  });

  describe('Primary Button Click', () => {
    it('should emit "finish-onboarding" when primary button is clicked', async () => {
      const primaryButton = wrapper.findComponent(
        '[data-test-id="modal-dialog"]',
      );

      await primaryButton.vm.$emit('primary-button-click');
      expect(wrapper.emitted('finish-onboarding')).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match the snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
