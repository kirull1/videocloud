import type { Meta, StoryObj } from '@storybook/vue3';
import VideoCard from './VideoCard.vue';

const meta = {
  title: 'Entities/Video/VideoCard',
  component: VideoCard,
  tags: ['autodocs'],
  argTypes: {
    id: { control: 'text' },
    title: { control: 'text' },
    thumbnailUrl: { control: 'text' },
    duration: { control: 'number' },
    views: { control: 'number' },
    uploadDate: { control: 'date' },
    channelName: { control: 'text' },
    channelAvatarUrl: { control: 'text' },
    isNew: { control: 'boolean' },
    isWatched: { control: 'boolean' },
    onClick: { action: 'click' },
    onChannelClick: { action: 'channelClick' }
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    () => ({
      template: '<div style="width: 360px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof VideoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'video-1',
    title: 'How to Build a Modern Web Application with Vue 3',
    thumbnailUrl: 'https://lipsum.app/random/640x360',
    duration: 845,
    views: 12500,
    uploadDate: new Date(2025, 4, 1),
    channelName: 'Vue Mastery',
    channelAvatarUrl: 'https://lipsum.app/random/100x100',
    isNew: false,
    isWatched: false
  },
};

export const ShortTitle: Story = {
  args: {
    ...Default.args,
    title: 'Quick Vue 3 Tip',
  },
};

export const LongTitle: Story = {
  args: {
    ...Default.args,
    title: 'The Complete Guide to Building Enterprise-Scale Applications with Vue 3, TypeScript, and the Composition API - Part 1: Getting Started',
  },
};

export const NewVideo: Story = {
  args: {
    ...Default.args,
    uploadDate: new Date(),
    isNew: true,
  },
};

export const WatchedVideo: Story = {
  args: {
    ...Default.args,
    isWatched: true,
  },
};

export const HighViewCount: Story = {
  args: {
    ...Default.args,
    views: 1500000,
  },
};

export const NoChannel: Story = {
  args: {
    ...Default.args,
    channelName: '',
    channelAvatarUrl: '',
  },
};

export const Mobile: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};