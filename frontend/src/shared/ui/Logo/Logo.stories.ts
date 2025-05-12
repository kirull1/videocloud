import type { Meta, StoryObj } from '@storybook/vue3';
import Logo from './Logo.vue';

const meta = {
  title: 'Shared/Logo',
  component: Logo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    colorScheme: {
      control: { type: 'select' },
      options: ['primary', 'white'],
    },
  },
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F7FAFD' },
        { name: 'dark', value: '#161B23' },
      ],
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'medium',
    colorScheme: 'primary',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    colorScheme: 'primary',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    colorScheme: 'primary',
  },
};

export const White: Story = {
  args: {
    size: 'medium',
    colorScheme: 'white',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};