import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProgressBar from '@/components/ProgressBar.vue';

describe('ProgressBar', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(ProgressBar, {
      props,
      global: {
        stubs: {
          UnnnicProgressBar: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    wrapper = createWrapper({ title: 'Loading...' });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('Should render the progress bar with the provided title', () => {
    const progressBar = wrapper.findComponent('[data-test-id="progress-bar"]');
    expect(progressBar.exists()).toBe(true);
    expect(progressBar.props('title')).toBe('Loading...');
  });

  it('Should initialize progress at 0', () => {
    const progressBar = wrapper.findComponent('[data-test-id="progress-bar"]');
    expect(progressBar.props('modelValue')).toBe(0);
  });

  it('Should start the progress bar after a delay of 2000ms', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    vi.advanceTimersByTime(2000);
    const progressBar = wrapper.findComponent('[data-test-id="progress-bar"]');
    expect(progressBar.props('modelValue')).toBe(0);
    expect(setIntervalSpy).toHaveBeenCalled();
  });

  it('Should increment progress periodically based on timeInterval prop', async () => {
    wrapper = createWrapper({ timeInterval: 100 });

    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(100);
    await wrapper.vm.$nextTick();

    expect(
      wrapper
        .findComponent('[data-test-id="progress-bar"]')
        .props('modelValue'),
    ).toBe(1);

    vi.advanceTimersByTime(300);
    await wrapper.vm.$nextTick();
    expect(
      wrapper
        .findComponent('[data-test-id="progress-bar"]')
        .props('modelValue'),
    ).toBe(4);
  });

  it('Should emit "progress-complete" when progress reaches 100', async () => {
    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(50 * 101);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('progress-complete')).toBeTruthy();
  });

  it('Should stop interval on component unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    wrapper.unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('Matches the snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
