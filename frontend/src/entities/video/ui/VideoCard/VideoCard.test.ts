import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VideoCard from './VideoCard.vue';

describe('VideoCard Component', () => {
  it('renders with required props', () => {
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg'
      }
    });
    
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.video-card__title').text()).toBe('Test Video');
    expect(wrapper.find('.video-card__thumbnail').attributes('src')).toBe('https://example.com/thumbnail.jpg');
    expect(wrapper.find('.video-card__thumbnail').attributes('alt')).toBe('Test Video');
  });
  
  it('formats duration correctly', () => {
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        duration: 125
      }
    });
    
    expect(wrapper.find('.video-card__duration').text()).toBe('2:05');
  });
  
  it('formats views correctly for different magnitudes', async () => {
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        views: 500
      }
    });
    
    expect(wrapper.find('.video-card__views').text()).toBe('500 views');
    
    await wrapper.setProps({ views: 1500 });
    expect(wrapper.find('.video-card__views').text()).toBe('1.5K views');
    
    await wrapper.setProps({ views: 1500000 });
    expect(wrapper.find('.video-card__views').text()).toBe('1.5M views');
  });
  
  it('formats date correctly for different time periods', async () => {
    const now = new Date();
    
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        uploadDate: now
      }
    });
    
    expect(wrapper.find('.video-card__date').text()).toBe('Today');
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    await wrapper.setProps({ uploadDate: yesterday });
    expect(wrapper.find('.video-card__date').text()).toBe('Yesterday');
    
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    await wrapper.setProps({ uploadDate: fiveDaysAgo });
    expect(wrapper.find('.video-card__date').text()).toBe('5 days ago');
    
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    await wrapper.setProps({ uploadDate: twoWeeksAgo });
    expect(wrapper.find('.video-card__date').text()).toBe('2 weeks ago');
    
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    await wrapper.setProps({ uploadDate: threeMonthsAgo });
    expect(wrapper.find('.video-card__date').text()).toBe('3 months ago');
    
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    await wrapper.setProps({ uploadDate: twoYearsAgo });
    expect(wrapper.find('.video-card__date').text()).toBe('2 years ago');
  });
  
  it('shows NEW badge when isNew is true', async () => {
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        isNew: false
      }
    });
    
    expect(wrapper.find('.video-card__badge').exists()).toBe(false);
    
    await wrapper.setProps({ isNew: true });
    expect(wrapper.find('.video-card__badge').exists()).toBe(true);
    expect(wrapper.find('.video-card__badge').text()).toBe('NEW');
  });
  
  it('shows progress bar when isWatched is true', async () => {
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        isWatched: false
      }
    });
    
    expect(wrapper.find('.video-card__progress-bar').exists()).toBe(false);
    
    await wrapper.setProps({ isWatched: true });
    expect(wrapper.find('.video-card__progress-bar').exists()).toBe(true);
    expect(wrapper.classes()).toContain('video-card--watched');
  });
  
  it('emits click event with video id when clicked', async () => {
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg'
      }
    });
    
    await wrapper.trigger('click');
    
    expect(wrapper.emitted('click')).toBeTruthy();
    expect(wrapper.emitted('click')?.[0]).toEqual(['video-1']);
  });
  
  it('emits channelClick event with channel name when channel is clicked', async () => {
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        channelName: 'Test Channel',
        channelAvatarUrl: 'https://example.com/avatar.jpg'
      }
    });
    
    const channelName = wrapper.find('.video-card__channel-name');
    await channelName.trigger('click');
    
    expect(wrapper.emitted('channelClick')).toBeTruthy();
    expect(wrapper.emitted('channelClick')?.[0]).toEqual(['Test Channel']);
  });
  
  it('does not show channel elements when channelName is empty', () => {
    const wrapper = mount(VideoCard, {
      props: {
        id: 'video-1',
        title: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        channelName: ''
      }
    });
    
    expect(wrapper.find('.video-card__channel-name').exists()).toBe(false);
  });
});