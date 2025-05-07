import type { Meta, StoryObj } from '@storybook/vue3';
import VideoUpload from './VideoUpload.vue';

const meta = {
  title: 'Features/VideoUpload',
  component: VideoUpload,
  tags: ['autodocs'],
  argTypes: {
    maxFileSize: { control: 'number' },
    allowedFileTypes: { control: 'object' },
    multiple: { control: 'boolean' },
    uploading: { control: 'boolean' },
    uploadProgress: { control: 'range', min: 0, max: 100, step: 1 },
    error: { control: 'text' },
    onFileSelected: { action: 'fileSelected' },
    onUploadStart: { action: 'uploadStart' },
    onCancel: { action: 'cancel' },
    onMetadataChange: { action: 'metadataChange' }
  },
  parameters: {
    layout: 'centered',
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
      template: '<div style="width: 800px; max-width: 100%;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof VideoUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    maxFileSize: 1024 * 1024 * 500,
    allowedFileTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    multiple: false,
    uploading: false,
    uploadProgress: 0,
    error: ''
  },
};

export const Uploading: Story = {
  args: {
    ...Default.args,
    uploading: true,
    uploadProgress: 45
  },
};

export const UploadComplete: Story = {
  args: {
    ...Default.args,
    uploading: true,
    uploadProgress: 100
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: 'Failed to upload video. Please try again.'
  },
};

export const SmallFileSizeLimit: Story = {
  args: {
    ...Default.args,
    maxFileSize: 1024 * 1024 * 10
  },
};

export const RestrictedFileTypes: Story = {
  args: {
    ...Default.args,
    allowedFileTypes: ['video/mp4']
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