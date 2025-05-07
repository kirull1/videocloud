import type { Meta, StoryObj } from '@storybook/vue3';
import VideoPlayer from './VideoPlayer.vue';

const meta = {
  title: 'Entities/Video/VideoPlayer',
  component: VideoPlayer,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    poster: { control: 'text' },
    autoplay: { control: 'boolean' },
    controls: { control: 'boolean' },
    loop: { control: 'boolean' },
    muted: { control: 'boolean' },
    height: { control: 'text' },
    width: { control: 'text' },
    fluid: { control: 'boolean' },
    playbackRates: { control: 'object' },
    onPlay: { action: 'play' },
    onPause: { action: 'pause' },
    onEnded: { action: 'ended' },
    onTimeupdate: { action: 'timeupdate' },
    onVolumechange: { action: 'volumechange' },
    onReady: { action: 'ready' }
  },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    () => ({
      template: '<div style="width: 640px;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof VideoPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    autoplay: false,
    controls: true,
    loop: false,
    muted: false,
    height: 'auto',
    width: '100%',
    fluid: true,
    playbackRates: [0.5, 1, 1.5, 2]
  },
};

export const Autoplay: Story = {
  args: {
    ...Default.args,
    autoplay: true,
    muted: true, // Browsers require muted for autoplay
  },
};

export const NoControls: Story = {
  args: {
    ...Default.args,
    controls: false,
  },
};

export const LoopEnabled: Story = {
  args: {
    ...Default.args,
    loop: true,
  },
};

export const CustomSize: Story = {
  args: {
    ...Default.args,
    width: '480px',
    height: '270px',
    fluid: false,
  },
};