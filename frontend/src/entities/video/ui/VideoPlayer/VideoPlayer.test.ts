import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import VideoPlayer from './VideoPlayer.vue';

beforeEach(() => {
  window.HTMLVideoElement.prototype.load = vi.fn();
  window.HTMLVideoElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
  window.HTMLVideoElement.prototype.pause = vi.fn();
  
  let paused = true;
  Object.defineProperty(window.HTMLVideoElement.prototype, 'paused', {
    get: () => paused,
    set: (value) => { paused = value },
    configurable: true
  });
  
  let volume = 1;
  Object.defineProperty(window.HTMLVideoElement.prototype, 'volume', {
    get: () => volume,
    set: (value) => { volume = value },
    configurable: true
  });
  
  let currentTime = 0;
  Object.defineProperty(window.HTMLVideoElement.prototype, 'currentTime', {
    get: () => currentTime,
    set: (value) => { currentTime = value },
    configurable: true
  });
});

describe('VideoPlayer Component', () => {
  it('renders with default props', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: 'https://example.com/video.mp4'
      }
    });
    
    expect(wrapper.exists()).toBe(true);
    
    const videoElement = wrapper.find('video');
    expect(videoElement.exists()).toBe(true);
    
    expect(videoElement.attributes('src')).toBe('https://example.com/video.mp4');
    
    expect(videoElement.attributes('controls')).toBeDefined();
    expect(videoElement.attributes('autoplay')).toBeUndefined();
    expect(videoElement.attributes('loop')).toBeUndefined();
    expect(videoElement.attributes('muted')).toBeUndefined();
  });
  
  it('applies custom props correctly', () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/poster.jpg',
        autoplay: true,
        controls: false,
        loop: true,
        muted: true,
        height: '480px',
        width: '640px'
      }
    });
    
    const videoElement = wrapper.find('video');
    
    expect(videoElement.attributes('src')).toBe('https://example.com/video.mp4');
    expect(videoElement.attributes('poster')).toBe('https://example.com/poster.jpg');
    expect(videoElement.attributes('autoplay')).toBeDefined();
    expect(videoElement.attributes('controls')).toBeUndefined();
    expect(videoElement.attributes('loop')).toBeDefined();
    expect(videoElement.attributes('muted')).toBeDefined();
    expect(videoElement.attributes('height')).toBe('480px');
    expect(videoElement.attributes('width')).toBe('640px');
  });
  
  it('emits events correctly', async () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: 'https://example.com/video.mp4'
      }
    });
    
    const videoElement = wrapper.find('video').element;
    
    videoElement.dispatchEvent(new Event('play'));
    await flushPromises();
    expect(wrapper.emitted('play')).toBeTruthy();
    
    videoElement.dispatchEvent(new Event('pause'));
    await flushPromises();
    expect(wrapper.emitted('pause')).toBeTruthy();
    
    videoElement.dispatchEvent(new Event('ended'));
    await flushPromises();
    expect(wrapper.emitted('ended')).toBeTruthy();
    
    videoElement.dispatchEvent(new Event('timeupdate'));
    await flushPromises();
    expect(wrapper.emitted('timeupdate')).toBeTruthy();
    
    videoElement.dispatchEvent(new Event('volumechange'));
    await flushPromises();
    expect(wrapper.emitted('volumechange')).toBeTruthy();
  });
  
  it('updates source when src prop changes', async () => {
    const wrapper = mount(VideoPlayer, {
      props: {
        src: 'https://example.com/video1.mp4'
      }
    });
    
    const initialVideoElement = wrapper.find('video').element;
    expect(initialVideoElement.src).toContain('video1.mp4');
    
    await wrapper.setProps({
      src: 'https://example.com/video2.mp4'
    });
    
    const updatedVideoElement = wrapper.find('video').element;
    expect(updatedVideoElement.src).toContain('video2.mp4');
    
    expect(updatedVideoElement.load).toHaveBeenCalled();
  });
});