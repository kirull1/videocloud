import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Auth from './Auth.vue';

describe('Auth Component', () => {
  it('renders logged out state by default', () => {
    const wrapper = mount(Auth);
    expect(wrapper.exists()).toBe(true);
    const loginButton = wrapper.find('.auth__button--login');
    const signupButton = wrapper.find('.auth__button--signup');
    expect(loginButton.exists()).toBe(true);
    expect(signupButton.exists()).toBe(true);
    expect(wrapper.find('.auth__user').exists()).toBe(false);
  });
  it('renders logged in state with user name and default avatar', () => {
    const userName = 'John Doe';
    const wrapper = mount(Auth, {
      props: { 
        isAuthenticated: true,
        userName
      }
    });
    const userInfo = wrapper.find('.auth__user');
    expect(userInfo.exists()).toBe(true);
    const nameElement = wrapper.find('.auth__name');
    expect(nameElement.text()).toBe(userName);
    const avatarElement = wrapper.find('.auth__avatar');
    expect(avatarElement.text()).toBe('J');
    const logoutButton = wrapper.find('.auth__button--logout');
    expect(logoutButton.exists()).toBe(true);
    expect(wrapper.find('.auth__button--login').exists()).toBe(false);
    expect(wrapper.find('.auth__button--signup').exists()).toBe(false);
  });
  it('renders logged in state with user name and avatar', () => {
    const userName = 'John Doe';
    const avatarUrl = 'https://example.com/avatar.jpg';
    const wrapper = mount(Auth, {
      props: { 
        isAuthenticated: true,
        userName,
        avatarUrl
      }
    });
    const avatarElement = wrapper.find('.auth__avatar');
    expect(avatarElement.attributes('style')).toContain(`backgroundImage: url(${avatarUrl})`);
    expect(avatarElement.text()).toBe('');
  });
  it('emits login event when login button is clicked', async () => {
    const wrapper = mount(Auth);
    const loginButton = wrapper.find('.auth__button--login');
    await loginButton.trigger('click');
    expect(wrapper.emitted('login')).toBeTruthy();
    expect(wrapper.emitted('login')?.length).toBe(1);
  });
  it('emits signup event when signup button is clicked', async () => {
    const wrapper = mount(Auth);
    const signupButton = wrapper.find('.auth__button--signup');
    await signupButton.trigger('click');
    expect(wrapper.emitted('signup')).toBeTruthy();
    expect(wrapper.emitted('signup')?.length).toBe(1);
  });
  it('emits logout event when logout button is clicked', async () => {
    const wrapper = mount(Auth, {
      props: { 
        isAuthenticated: true,
        userName: 'John Doe'
      }
    });
    
    const logoutButton = wrapper.find('.auth__button--logout');
    await logoutButton.trigger('click');
    expect(wrapper.emitted('logout')).toBeTruthy();
    expect(wrapper.emitted('logout')?.length).toBe(1);
  });
});