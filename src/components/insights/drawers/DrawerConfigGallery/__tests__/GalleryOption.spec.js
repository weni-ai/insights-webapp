import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import GalleryOption from '../GalleryOption.vue';

describe('GalleryOption.vue', () => {
  it('renders title and description props correctly', () => {
    const wrapper = mount(GalleryOption, {
      props: {
        title: 'Option Title',
        description: 'This is a description',
      },
    });

    expect(wrapper.find('[data-testid="galery-option-title"]').text()).toBe(
      'Option Title',
    );
    expect(
      wrapper.find('[data-testid="galery-option-description"]').text(),
    ).toBe('This is a description');
  });

  it('renders empty strings by default', () => {
    const wrapper = mount(GalleryOption);

    expect(wrapper.find('[data-testid="galery-option-title"]').text()).toBe('');
    expect(
      wrapper.find('[data-testid="galery-option-description"]').text(),
    ).toBe('');
  });
});
