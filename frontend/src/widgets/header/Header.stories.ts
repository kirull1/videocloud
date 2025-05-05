import type { Meta, StoryObj } from '@storybook/vue3';
import Header from './Header.vue';

const meta = {
  title: 'Widgets/Header',
  component: Header,
  tags: ['autodocs'],
  argTypes: {
    isAuthenticated: { control: 'boolean' },
    userName: { control: 'text' },
    isSearchLoading: { control: 'boolean' },
    onSearch: { action: 'search' },
    onLogin: { action: 'login' },
    onSignup: { action: 'signup' },
    onLogout: { action: 'logout' }
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 200,
      },
    },
    backgrounds: {
      default: 'light-gray',
      values: [
        { name: 'light-gray', value: '#f5f5f5' },
      ],
    },
  },
  decorators: [
    () => ({
      template: '<div style="width: 100%;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isAuthenticated: false,
    isSearchLoading: false
  },
};

export const LoggedIn: Story = {
  args: {
    isAuthenticated: true,
    userName: 'John Doe',
    isSearchLoading: false
  },
};

export const SearchLoading: Story = {
  args: {
    isAuthenticated: false,
    isSearchLoading: true
  },
};
