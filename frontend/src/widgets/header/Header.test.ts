import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Header from './Header.vue';
import Logo from '@/shared/ui/Logo';
import Search from '@/features/search';
import Auth from '@/features/auth';

// Mock the child components
vi.mock('@/shared/ui/Logo', () => ({
  default: {
    name: 'Logo',
    render: () => {},
  },
}));

vi.mock('@/features/search', () => ({
  default: {
    name: 'Search',
    render: () => {},
    emits: ['search'],
  },
}));

vi.mock('@/features/auth', () => ({
  default: {
    name: 'Auth',
    render: () => {},
    emits: ['login', 'signup', 'logout'],
  },
}));

describe('Header', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Header);
    
    // Check if all major sections are rendered
    expect(wrapper.find('.header').exists()).toBe(true);
    expect(wrapper.find('.header__logo').exists()).toBe(true);
    expect(wrapper.find('.header__search').exists()).toBe(true);
    expect(wrapper.find('.header__auth').exists()).toBe(true);
    
    // Check if child components are rendered
    expect(wrapper.findComponent(Logo).exists()).toBe(true);
    expect(wrapper.findComponent(Search).exists()).toBe(true);
    expect(wrapper.findComponent(Auth).exists()).toBe(true);
  });

  it('passes correct props to child components', async () => {
    const wrapper = mount(Header, {
      props: {
        isAuthenticated: true,
        userName: 'TestUser',
        isSearchLoading: true
      }
    });
    
    // Check if props are passed correctly using attributes
    const searchComponent = wrapper.findComponent(Search);
    expect(searchComponent.attributes()).toHaveProperty('is-loading');
    
    const authComponent = wrapper.findComponent(Auth);
    expect(authComponent.attributes()).toHaveProperty('is-authenticated');
    expect(authComponent.attributes()).toHaveProperty('user-name', 'TestUser');
  });

  it('emits search event when Search component triggers search', async () => {
    const wrapper = mount(Header);
    
    // Simulate search event from Search component
    await wrapper.findComponent(Search).vm.$emit('search', 'test query');
    
    // Check if Header emitted the event with correct payload
    expect(wrapper.emitted()).toHaveProperty('search');
    expect(wrapper.emitted('search')![0]).toEqual(['test query']);
  });

  it('emits login, signup, and logout events', async () => {
    const wrapper = mount(Header);
    
    // Simulate events from Auth component
    await wrapper.findComponent(Auth).vm.$emit('login');
    await wrapper.findComponent(Auth).vm.$emit('signup');
    await wrapper.findComponent(Auth).vm.$emit('logout');
    
    // Check if Header emitted these events
    expect(wrapper.emitted()).toHaveProperty('login');
    expect(wrapper.emitted()).toHaveProperty('signup');
    expect(wrapper.emitted()).toHaveProperty('logout');
  });
});