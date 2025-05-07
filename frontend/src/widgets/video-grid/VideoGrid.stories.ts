import type { Meta, StoryObj } from '@storybook/vue3';
import VideoGrid from './VideoGrid.vue';
import type { VideoItem } from './VideoGrid.vue';

const generateMockVideos = (count: number): VideoItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `video-${i + 1}`,
    title: i % 3 === 0 
      ? `Short video title ${i + 1}`
      : i % 3 === 1
        ? `Medium length video title that might wrap to the next line ${i + 1}`
        : `Very long video title that will definitely wrap to multiple lines and might be truncated in the UI component ${i + 1}`,
    thumbnailUrl: `https://picsum.photos/seed/video${i + 1}/640/360`,
    duration: 120 + i * 60,
    views: 1000 * (i + 1),
    uploadDate: new Date(Date.now() - i * 86400000 * (i % 5 + 1)),
    channelName: `Channel ${i % 5 + 1}`,
    channelAvatarUrl: `https://picsum.photos/seed/channel${i % 5 + 1}/100/100`,
    isNew: i % 7 === 0,
    isWatched: i % 4 === 0
  }));
};

const meta = {
  title: 'Widgets/VideoGrid',
  component: VideoGrid,
  tags: ['autodocs'],
  argTypes: {
    videos: { control: 'object' },
    loading: { control: 'boolean' },
    columns: { control: 'object' },
    gap: { control: 'text' },
    emptyMessage: { control: 'text' },
    onVideoClick: { action: 'videoClick' },
    onChannelClick: { action: 'channelClick' }
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 600,
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
      template: '<div style="padding: 24px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof VideoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    videos: generateMockVideos(12),
    loading: false,
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5
    },
    gap: '16px',
    emptyMessage: 'No videos found'
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    videos: [],
    emptyMessage: 'No videos found. Try a different search.'
  },
};

export const FewItems: Story = {
  args: {
    ...Default.args,
    videos: generateMockVideos(3)
  },
};

export const CustomColumns: Story = {
  args: {
    ...Default.args,
    columns: {
      xs: 1,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 4
    }
  },
};

export const LargeGap: Story = {
  args: {
    ...Default.args,
    gap: '32px'
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

export const Tablet: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};