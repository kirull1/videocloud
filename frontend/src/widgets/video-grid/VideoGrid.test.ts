import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VideoGrid from './VideoGrid.vue';
import { VideoCard } from '@/entities/video';

vi.mock('@/entities/video', () => ({
  VideoCard: {
    name: 'VideoCard',
    props: {
      id: String,
      title: String,
      thumbnailUrl: String,
      duration: Number,
      views: Number,
      uploadDate: Date,
      channelName: String,
      channelAvatarUrl: String,
      isNew: Boolean,
      isWatched: Boolean
    },
    template: '<div class="video-card-mock" :data-id="id">{{ title }}</div>',
    emits: ['click', 'channelClick']
  }
}));

describe('VideoGrid Component', () => {
  const mockVideos = [
    {
      id: 'video-1',
      title: 'Test Video 1',
      thumbnailUrl: 'https://example.com/thumbnail1.jpg',
      duration: 120,
      views: 1000,
      uploadDate: new Date('2025-05-01'),
      channelName: 'Test Channel',
      channelAvatarUrl: 'https://example.com/avatar.jpg'
    },
    {
      id: 'video-2',
      title: 'Test Video 2',
      thumbnailUrl: 'https://example.com/thumbnail2.jpg',
      duration: 180,
      views: 2000,
      uploadDate: new Date('2025-05-02'),
      channelName: 'Test Channel',
      channelAvatarUrl: 'https://example.com/avatar.jpg',
      isNew: true
    },
    {
      id: 'video-3',
      title: 'Test Video 3',
      thumbnailUrl: 'https://example.com/thumbnail3.jpg',
      duration: 240,
      views: 3000,
      uploadDate: new Date('2025-05-03'),
      channelName: 'Test Channel',
      channelAvatarUrl: 'https://example.com/avatar.jpg',
      isWatched: true
    }
  ];

  it('renders the correct number of VideoCard components', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        videos: mockVideos
      }
    });
    
    const videoCards = wrapper.findAllComponents(VideoCard);
    expect(videoCards.length).toBe(mockVideos.length);
  });
  
  it('passes the correct props to each VideoCard', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        videos: mockVideos
      }
    });
    
    const videoCards = wrapper.findAllComponents(VideoCard);
    
    videoCards.forEach((card, index) => {
      const video = mockVideos[index];
      expect(card.props('id')).toBe(video.id);
      expect(card.props('title')).toBe(video.title);
      expect(card.props('thumbnailUrl')).toBe(video.thumbnailUrl);
      expect(card.props('duration')).toBe(video.duration);
      expect(card.props('views')).toBe(video.views);
      expect(card.props('uploadDate')).toEqual(video.uploadDate);
      expect(card.props('channelName')).toBe(video.channelName);
      expect(card.props('channelAvatarUrl')).toBe(video.channelAvatarUrl);
      expect(card.props('isNew')).toBe(video.isNew || false);
      expect(card.props('isWatched')).toBe(video.isWatched || false);
    });
  });
  
  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        videos: mockVideos,
        loading: true
      }
    });
    
    expect(wrapper.find('.video-grid__loading').exists()).toBe(true);
    expect(wrapper.findAllComponents(VideoCard).length).toBe(0);
    
    const skeletons = wrapper.findAll('.video-grid__skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
  
  it('shows empty state when videos array is empty', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        videos: [],
        emptyMessage: 'Custom empty message'
      }
    });
    
    expect(wrapper.find('.video-grid__empty').exists()).toBe(true);
    expect(wrapper.find('.video-grid__empty').text()).toBe('Custom empty message');
    expect(wrapper.findAllComponents(VideoCard).length).toBe(0);
  });
  
  it('applies custom grid columns and gap', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        videos: mockVideos,
        columns: {
          xs: 2,
          md: 4,
          xl: 6
        },
        gap: '24px'
      }
    });
    
    const gridContainer = wrapper.find('.video-grid__container');
    expect(gridContainer.attributes('style')).toContain('gap: 24px');
    expect(gridContainer.attributes('style')).toContain('grid-template-columns: repeat(var(--grid-columns, 4), 1fr)');
  });
  
  it('emits videoClick event with correct video id', async () => {
    const wrapper = mount(VideoGrid, {
      props: {
        videos: mockVideos
      }
    });
    
    const firstVideoCard = wrapper.findComponent(VideoCard);
    await firstVideoCard.vm.$emit('click', 'video-1');
    
    expect(wrapper.emitted('videoClick')).toBeTruthy();
    expect(wrapper.emitted('videoClick')?.[0]).toEqual(['video-1']);
  });
  
  it('emits channelClick event with correct channel name', async () => {
    const wrapper = mount(VideoGrid, {
      props: {
        videos: mockVideos
      }
    });
    
    const firstVideoCard = wrapper.findComponent(VideoCard);
    await firstVideoCard.vm.$emit('channelClick', 'Test Channel');
    
    expect(wrapper.emitted('channelClick')).toBeTruthy();
    expect(wrapper.emitted('channelClick')?.[0]).toEqual(['Test Channel']);
  });
});