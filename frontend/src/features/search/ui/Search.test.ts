import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Search from './Search.vue';

describe('Search Component', () => {
  it('renders with default props', () => {
    const wrapper = mount(Search);
    expect(wrapper.exists()).toBe(true);
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('placeholder')).toBe('Search videos...');
    const button = wrapper.find('.search__button');
    expect(button.exists()).toBe(true);
    expect(wrapper.find('.search__icon').exists()).toBe(true);
    expect(wrapper.find('.search__loader').exists()).toBe(false);
  });
  it('applies custom placeholder', () => {
    const customPlaceholder = 'Find your favorite content...';
    const wrapper = mount(Search, {
      props: { 
        placeholder: customPlaceholder
      }
    });
    
    const input = wrapper.find('input');
    expect(input.attributes('placeholder')).toBe(customPlaceholder);
  });
  it('shows loader when isLoading is true', () => {
    const wrapper = mount(Search, {
      props: { 
        isLoading: true
      }
    });
    expect(wrapper.find('.search__loader').exists()).toBe(true);
    expect(wrapper.find('.search__icon').exists()).toBe(false);
    const button = wrapper.find('.search__button');
    expect(button.classes()).toContain('search__button--loading');
  });
  it('emits search event on enter key', async () => {
    const wrapper = mount(Search);
    const input = wrapper.find('input');
    const searchValue = 'test search';
    await input.setValue(searchValue);
    await input.trigger('keyup.enter');
    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')?.[0]).toEqual([searchValue]);
  });
});