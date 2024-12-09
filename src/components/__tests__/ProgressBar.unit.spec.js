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
    expect(wrapper.vm.progress).toBe(0);
  });

  it('Should start the progress bar after a delay of 2000ms', () => {
    vi.advanceTimersByTime(2000);
    expect(wrapper.vm.progress).toBe(0);
    expect(wrapper.vm.interval).not.toBeNull();
  });

  it('Should increment progress periodically based on timeInterval prop', () => {
    wrapper = createWrapper({ timeInterval: 100 });

    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(100);

    expect(wrapper.vm.progress).toBe(1);

    vi.advanceTimersByTime(300);
    expect(wrapper.vm.progress).toBe(4);
  });

  it('Should emit "progress-complete" when progress reaches 100', async () => {
    vi.advanceTimersByTime(2000);
    wrapper.vm.progress = 99;

    vi.advanceTimersByTime(100);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.progress).toBe(100);
    expect(wrapper.emitted('progress-complete')).toBeTruthy();
  });

  it('Should stop interval on component unmount', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');

    wrapper.unmount();
    expect(clearIntervalSpy).toHaveBeenCalledWith(wrapper.vm.interval);
  });

  it('Matches the snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
