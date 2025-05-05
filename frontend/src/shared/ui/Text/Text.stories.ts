import type { Meta, StoryObj } from '@storybook/vue3';
import Text from './Text.vue';


const meta = {
  title: 'Shared/UI/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    size: { 
      control: { type: 'select' }, 
      options: ['small', 'medium', 'large'] 
    },
    weight: { 
      control: { type: 'select' }, 
      options: ['normal', 'bold'] 
    },
    color: { 
      control: { type: 'select' }, 
      options: ['default', 'primary', 'secondary', 'error'] 
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;


export const Default: Story = {
  args: {
    content: 'This is a default text',
    size: 'medium',
    weight: 'normal',
    color: 'default',
  },
};

export const Small: Story = {
  args: {
    content: 'This is a small text',
    size: 'small',
    weight: 'normal',
    color: 'default',
  },
};

export const Large: Story = {
  args: {
    content: 'This is a large text',
    size: 'large',
    weight: 'normal',
    color: 'default',
  },
};

export const Bold: Story = {
  args: {
    content: 'This is a bold text',
    size: 'medium',
    weight: 'bold',
    color: 'default',
  },
};

export const Primary: Story = {
  args: {
    content: 'This is a primary color text',
    size: 'medium',
    weight: 'normal',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    content: 'This is a secondary color text',
    size: 'medium',
    weight: 'normal',
    color: 'secondary',
  },
};

export const Error: Story = {
  args: {
    content: 'This is an error color text',
    size: 'medium',
    weight: 'normal',
    color: 'error',
  },
};