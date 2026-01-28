import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount, config } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n';
import Unnnic from '@weni/unnnic-system';
import WelcomeOnboardingModal from '@/components/WelcomeOnboardingModal.vue';
import { UnnnicModalDialog } from '@weni/unnnic-system';

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

const createWrapper = (props = {}) => {
  return shallowMount(WelcomeOnboardingModal, {
    props: {
      showModal: true,
      ...props,
    },
    global: {
      plugins: [Unnnic],
    },
  });
};

describe('WelcomeOnboardingModal.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Rendering and Props', () => {
    it('renders UnnnicModalDialog', () => {
      const modalDialog = wrapper.findComponent(UnnnicModalDialog);

      expect(modalDialog.exists()).toBe(true);
    });

    it('displays the modal title, image, and content correctly', () => {
      console.log(wrapper.html());
      expect(wrapper.vm.$t('onboarding.welcome_modal.title')).toBeDefined();
      expect(wrapper.vm.$t('onboarding.welcome_modal.text')).toBeDefined();
      expect(wrapper.html()).toContain('welcome-onboarding-modal');
    });
  });

  describe('Primary and Secondary Buttons', () => {
    it('renders primary button with correct label', () => {
      const modalDialog = wrapper.findComponent({ name: 'UnnnicModalDialog' });
      expect(modalDialog.props('primaryButtonProps').text).toBe(
        wrapper.vm.$t('onboarding.welcome_modal.button.go'),
      );
    });

    it('renders secondary button with correct label', () => {
      const modalDialog = wrapper.findComponent({ name: 'UnnnicModalDialog' });
      expect(modalDialog.props('secondaryButtonProps').text).toBe(
        wrapper.vm.$t('onboarding.welcome_modal.button.ignore'),
      );
    });
  });

  describe('Emit Events', () => {
    it('emits "start-onboarding" when primary button is clicked', async () => {
      const modalDialog = wrapper.findComponent({ name: 'UnnnicModalDialog' });
      await modalDialog.vm.$emit('primary-button-click');
      expect(wrapper.emitted('start-onboarding')).toBeTruthy();
    });

    it('calls ignoreOnboarding and emits "close" when secondary button is clicked', async () => {
      const modalDialog = wrapper.findComponent({ name: 'UnnnicModalDialog' });
      const ignoreOnboardingSpy = vi.spyOn(wrapper.vm, 'ignoreOnboarding');

      await modalDialog.vm.$emit('secondary-button-click');
      expect(ignoreOnboardingSpy).toHaveBeenCalled();
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });
});
