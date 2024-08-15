import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import OptionCreateNewDashboard from '@/components/insights/Layout/HeaderSelectDashboard/OptionCreateNewDashboard.vue';
import { unnnicDropdownItem } from '@weni/unnnic-system';

describe('OptionCreateNewDashboard', () => {
  let wrapper;

  const createWrapper = (props) => {
    return mount(OptionCreateNewDashboard, {
      props,
      global: {
        stubs: {
          UnnnicDropdownItem: unnnicDropdownItem,
          UnnnicIcon: true,
        },
        mocks: {
          $t: (msg) => msg,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper({});
  });

  it('Should have an option with the title "add_new_dashboard"', async () => {
    const addNewDashboardButton = wrapper.findComponent(
      '[data-testid=option-new-dashboard]',
    );

    expect(addNewDashboardButton.exists()).toBe(true);
    expect(wrapper.html()).toContain(
      wrapper.vm.$t('insights_header.add_new_dashboard'),
    );
  });

  it('Should render the UnnnicIcon component with the correct icon', () => {
    const icon = wrapper.findComponent(
      '[data-testid=option-new-dashboard-icon]',
    );
    expect(icon.exists()).toBe(true);
    expect(icon.props('icon')).toBe('add');
  });

  it('Should match the snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
