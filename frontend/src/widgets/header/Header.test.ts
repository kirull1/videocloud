import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Header from './Header.vue';
import Search from '@/features/search';
import Auth from '@/features/auth';

vi.mock('@/features/search', () => ({
  default: {
    name: 'Search',
    template: '<div class="search-mock"></div>',
    emits: ['search']
  }
}));

vi.mock('@/features/auth', () => ({
  default: {
    name: 'Auth',
    template: '<div class="auth-mock"></div>',
    emits: ['login', 'signup', 'logout']
  }
}));

describe('Header Component', () => {
  it('renders with default props', () => {
    const wrapper = mount(Header);
    
    expect(wrapper.exists()).toBe(true);
    
    const headerElement = wrapper.find('.header');
    expect(headerElement.exists()).toBe(true);
    
    const logoElement = wrapper.find('.header__logo-image');
    expect(logoElement.exists()).toBe(true);
    
    expect(logoElement.attributes('src')).toContain('logo.svg');
    
    expect(wrapper.findComponent({ name: 'Search' }).exists()).toBe(true);
    
    expect(wrapper.findComponent({ name: 'Auth' }).exists()).toBe(true);
  });
  
  it('renders custom logo when logoUrl is provided', () => {
    const logoUrl = 'https://example.com/logo.png';
    const wrapper = mount(Header, {
      props: { 
        logoUrl
      }
    });
    
    const logoElement = wrapper.find('.header__logo-image');
    expect(logoElement.attributes('src')).toBe(logoUrl);
  });
  
  it('passes isSearchLoading prop to Search component', async () => {
    const wrapper = mount(Header, {
      props: { 
        isSearchLoading: true
      }
    });
    
    const searchComponent = wrapper.findComponent(Search);
    expect(searchComponent.props('isLoading')).toBe(true);
  });
  
  it('passes authentication props to Auth component', async () => {
    const props = {
      isAuthenticated: true,
      userName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg'
    };
    
    const wrapper = mount(Header, {
      props
    });
    
    const authComponent = wrapper.findComponent(Auth);
    expect(authComponent.props('isAuthenticated')).toBe(props.isAuthenticated);
    expect(authComponent.props('userName')).toBe(props.userName);
    expect(authComponent.props('avatarUrl')).toBe(props.avatarUrl);
  });
  
  it('forwards search event from Search component', async () => {
    const wrapper = mount(Header);
    const searchComponent = wrapper.findComponent(Search);
    
    const searchQuery = 'test query';
    await searchComponent.vm.$emit('search', searchQuery);
    
    expect(wrapper.emitted('search')).toBeTruthy();
    expect(wrapper.emitted('search')?.[0]).toEqual([searchQuery]);
  });
  
  it('forwards login event from Auth component', async () => {
    const wrapper = mount(Header);
    const authComponent = wrapper.findComponent(Auth);
    
    await authComponent.vm.$emit('login');
    
    expect(wrapper.emitted('login')).toBeTruthy();
    expect(wrapper.emitted('login')?.length).toBe(1);
  });
  
  it('forwards signup event from Auth component', async () => {
    const wrapper = mount(Header);
    const authComponent = wrapper.findComponent(Auth);
    
    await authComponent.vm.$emit('signup');
    
    expect(wrapper.emitted('signup')).toBeTruthy();
    expect(wrapper.emitted('signup')?.length).toBe(1);
  });
  
  it('forwards logout event from Auth component', async () => {
    const wrapper = mount(Header);
    const authComponent = wrapper.findComponent(Auth);
    
    await authComponent.vm.$emit('logout');
    
    expect(wrapper.emitted('logout')).toBeTruthy();
    expect(wrapper.emitted('logout')?.length).toBe(1);
  });
  
  it('has responsive classes for different screen sizes', () => {
    const wrapper = mount(Header);
    
    const headerElement = wrapper.find('.header');
    expect(headerElement.exists()).toBe(true);
    
    const headerClasses = wrapper.find('.header').classes();
    
    expect(wrapper.find('.header__container').exists()).toBe(true);
    expect(wrapper.find('.header__logo').exists()).toBe(true);
    expect(wrapper.find('.header__search').exists()).toBe(true);
    expect(wrapper.find('.header__auth').exists()).toBe(true);
  });
});