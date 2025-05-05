import type { Meta, StoryObj } from '@storybook/vue3';
import Search from './Search.vue';

const meta = {
  title: 'Features/Search',
  component: Search,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    isLoading: { control: 'boolean' },
    onSearch: { action: 'search' }
  },
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search videos...',
    isLoading: false
  },
  decorators: [
    () => ({
      template: '<div style="width: 100%; padding: 20px;"><story /></div>',
    }),
  ],
};

export const Loading: Story = {
  args: {
    placeholder: 'Search videos...',
    isLoading: true
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Find your favorite content...',
    isLoading: false
  },
};