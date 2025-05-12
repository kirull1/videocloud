import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Logo from './Logo.vue';

describe('Logo', () => {
  it('renders with default props', () => {
    const wrapper = mount(Logo);
    expect(wrapper.find('.logo').exists()).toBe(true);
    expect(wrapper.find('.logo__text').text()).toBe('VideoCloud');
    expect(wrapper.classes()).toContain('logo--medium');
    expect(wrapper.classes()).toContain('logo--primary');
  });

  it('applies size classes correctly', async () => {
    const wrapper = mount(Logo, {
      props: {
        size: 'small'
      }
    });
    expect(wrapper.classes()).toContain('logo--small');
    
    await wrapper.setProps({ size: 'large' });
    expect(wrapper.classes()).toContain('logo--large');
  });

  it('applies colorScheme classes correctly', async () => {
    const wrapper = mount(Logo, {
      props: {
        colorScheme: 'white'
      }
    });
    expect(wrapper.classes()).toContain('logo--white');
    
    await wrapper.setProps({ colorScheme: 'primary' });
    expect(wrapper.classes()).toContain('logo--primary');
  });
});