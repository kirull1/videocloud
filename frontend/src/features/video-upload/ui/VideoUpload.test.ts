import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import VideoUpload from './VideoUpload.vue';
import type { UploadMetadata } from './VideoUpload.vue';

interface FileSelectedEvent {
  file: File;
  metadata: UploadMetadata;
}

interface UploadStartEvent {
  file: File;
  metadata: UploadMetadata;
}

describe('VideoUpload Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the dropzone when no file is selected', () => {
    const wrapper = mount(VideoUpload);
    
    expect(wrapper.find('.video-upload__dropzone').exists()).toBe(true);
    expect(wrapper.find('.video-upload__selected').exists()).toBe(false);
  });
  
  it('displays file size limits and allowed formats', () => {
    const wrapper = mount(VideoUpload, {
      props: {
        maxFileSize: 1024 * 1024 * 100,
        allowedFileTypes: ['video/mp4', 'video/webm']
      }
    });
    
    const infoText = wrapper.find('.video-upload__info').text();
    expect(infoText).toContain('100.0 MB');
    expect(infoText).toContain('MP4, WEBM');
  });
  
  it('handles file selection via input change', async () => {
    const wrapper = mount(VideoUpload);
    
    const file = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
    const input = wrapper.find('input[type="file"]');
    
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    expect(wrapper.find('.video-upload__dropzone').exists()).toBe(false);
    expect(wrapper.find('.video-upload__selected').exists()).toBe(true);
    expect(wrapper.find('.video-upload__file-name').text()).toBe('test-video.mp4');
    
    expect(wrapper.emitted('fileSelected')).toBeTruthy();
    const fileSelectedEvent = wrapper.emitted('fileSelected')?.[0][0] as FileSelectedEvent;
    expect(fileSelectedEvent.file).toBe(file);
    expect(fileSelectedEvent.metadata.title).toBe('test-video');
  });
  
  it('validates file size', async () => {
    const wrapper = mount(VideoUpload, {
      props: {
        maxFileSize: 1000
      }
    });
    
    const file = new File(['dummy content'.repeat(100)], 'large-video.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: 2000 });
    
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    expect(wrapper.find('.video-upload__error').text()).toContain('File is too large');
    expect(wrapper.find('.video-upload__button--upload').attributes('disabled')).toBeDefined();
  });
  
  it('validates file type', async () => {
    const wrapper = mount(VideoUpload, {
      props: {
        allowedFileTypes: ['video/mp4']
      }
    });
    
    const file = new File(['dummy content'], 'image.jpg', { type: 'image/jpeg' });
    
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    expect(wrapper.find('.video-upload__error').text()).toContain('Invalid file type');
    expect(wrapper.find('.video-upload__button--upload').attributes('disabled')).toBeDefined();
  });
  
  it('allows editing metadata', async () => {
    const wrapper = mount(VideoUpload);
    
    const file = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
    
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    const titleInput = wrapper.find('#video-title');
    await titleInput.setValue('Custom Video Title');
    
    const descriptionInput = wrapper.find('#video-description');
    await descriptionInput.setValue('This is a test description');
    
    const privateCheckbox = wrapper.find('.video-upload__checkbox');
    await privateCheckbox.setValue(true);
    
    expect(wrapper.emitted('metadataChange')).toBeTruthy();
    const lastMetadataEvent = wrapper.emitted('metadataChange')?.slice(-1)[0][0] as UploadMetadata;
    expect(lastMetadataEvent.title).toBe('Custom Video Title');
    expect(lastMetadataEvent.description).toBe('This is a test description');
    expect(lastMetadataEvent.isPrivate).toBe(true);
  });
  
  it('emits uploadStart event with file and metadata', async () => {
    const wrapper = mount(VideoUpload);
    
    const file = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
    
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    const titleInput = wrapper.find('#video-title');
    await titleInput.setValue('Custom Video Title');
    
    const uploadButton = wrapper.find('.video-upload__button--upload');
    await uploadButton.trigger('click');
    
    expect(wrapper.emitted('uploadStart')).toBeTruthy();
    const uploadStartEvent = wrapper.emitted('uploadStart')?.[0][0] as UploadStartEvent;
    expect(uploadStartEvent.file).toBe(file);
    expect(uploadStartEvent.metadata.title).toBe('Custom Video Title');
  });
  
  it('shows upload progress when uploading', async () => {
    const wrapper = mount(VideoUpload, {
      props: {
        uploading: true,
        uploadProgress: 42
      }
    });
    
    const file = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
    
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    expect(wrapper.find('.video-upload__progress').exists()).toBe(true);
    expect(wrapper.find('.video-upload__progress-text').text()).toContain('42%');
    expect(wrapper.find('.video-upload__progress-fill').attributes('style')).toContain('width: 42%');
  });
  
  it('disables form inputs when uploading', async () => {
    const wrapper = mount(VideoUpload, {
      props: {
        uploading: true
      }
    });
    
    const file = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
    
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    expect(wrapper.find('#video-title').attributes('disabled')).toBeDefined();
    expect(wrapper.find('#video-description').attributes('disabled')).toBeDefined();
    expect(wrapper.find('.video-upload__checkbox').attributes('disabled')).toBeDefined();
  });
  
  it('shows error message when provided', async () => {
    const wrapper = mount(VideoUpload, {
      props: {
        error: 'Upload failed due to network error'
      }
    });
    
    const file = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
    
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    expect(wrapper.find('.video-upload__error').text()).toBe('Upload failed due to network error');
  });
  
  it('emits cancel event and resets state when cancel button is clicked', async () => {
    const wrapper = mount(VideoUpload);
    
    const file = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
    
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false
    });
    
    await input.trigger('change');
    
    const cancelButton = wrapper.find('.video-upload__button--cancel');
    await cancelButton.trigger('click');
    
    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.find('.video-upload__dropzone').exists()).toBe(true);
    expect(wrapper.find('.video-upload__selected').exists()).toBe(false);
  });
});