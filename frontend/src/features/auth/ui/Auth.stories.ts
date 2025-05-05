import type { Meta, StoryObj } from '@storybook/vue3';
import Auth from './Auth.vue';

const meta = {
  title: 'Features/Auth',
  component: Auth,
  tags: ['autodocs'],
  argTypes: {
    isAuthenticated: { control: 'boolean' },
    userName: { control: 'text' },
    onLogin: { action: 'login' },
    onSignup: { action: 'signup' },
    onLogout: { action: 'logout' }
  },
} satisfies Meta<typeof Auth>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: {
    isAuthenticated: false
  },
  decorators: [
    () => ({
      template: '<div style="width: 100%; padding: 20px; background-color: #f5f5f5;"><story /></div>',
    }),
  ],
};

export const LoggedIn: Story = {
  args: {
    isAuthenticated: true,
    userName: 'John Doe',
  },
};

export const LoggedInWithAvatar: Story = {
  args: {
    isAuthenticated: true,
    userName: 'John Doe',
  },
};