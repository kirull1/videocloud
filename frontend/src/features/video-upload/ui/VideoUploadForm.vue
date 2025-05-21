<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userStore } from '@/features/auth/model/userStore';
import { videoStore } from '@/entities/video/model/videoStore';
import { VideoVisibility } from '@/entities/video/model/types';
import { categoryStore } from '@/entities/category';
import { tagStore } from '@/entities/tag';

// Router
const router = useRouter();

// State
const videoFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const thumbnailBlob = ref<Blob | null>(null);
const thumbnailUrl = ref<string | null>(null);
const isGeneratingThumbnail = ref(false);

// Form data
const title = ref('');
const description = ref('');
const categoryId = ref('');
const isPrivate = ref(false);
const tagIds = ref<string[]>([]);
const tagsInput = ref('');

// Computed
const isAuthenticated = computed(() => userStore.isAuthenticated.value);
const isUploading = computed(() => videoStore.uploadProgress.value.status === 'uploading' || 
                               videoStore.uploadProgress.value.status === 'processing');
const uploadProgress = computed(() => videoStore.uploadProgress.value.progress);
const uploadStatus = computed(() => videoStore.uploadProgress.value.status);
const error = computed(() => videoStore.error.value);
const successMessage = ref('');

const canSubmit = computed(() => 
  !!videoFile.value && 
  !!title.value && 
  !isUploading.value
);

// Computed for estimated time remaining
const startTime = ref(0);
const estimatedTimeRemaining = ref('');
const uploadSpeed = ref(0); // bytes per second

// Format time remaining
const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} minutes`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours} hours ${minutes} minutes`;
  }
};

// Update estimated time remaining
watch(uploadProgress, (newProgress) => {
  if (newProgress > 0 && newProgress < 100 && videoFile.value) {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime.value) / 1000; // in seconds
    
    if (elapsedTime > 0) {
      // Calculate upload speed (bytes per second)
      const bytesUploaded = videoFile.value.size * (newProgress / 100);
      uploadSpeed.value = bytesUploaded / elapsedTime;
      
      // Calculate remaining bytes
      const remainingBytes = videoFile.value.size - bytesUploaded;
      
      // Calculate estimated time remaining
      if (uploadSpeed.value > 0) {
        const timeRemaining = remainingBytes / uploadSpeed.value;
        estimatedTimeRemaining.value = formatTimeRemaining(timeRemaining);
      }
    }
  } else if (newProgress === 100) {
    estimatedTimeRemaining.value = '';
  }
});

// Load categories and tags when component is mounted
onMounted(async () => {
  try {
    await Promise.all([
      categoryStore.fetchCategories(),
      tagStore.fetchTags()
    ]);
  } catch (err) {
    console.error('Failed to load categories or tags:', err);
  }
});

// File size formatter
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format upload speed
const formatUploadSpeed = (): string => {
  if (uploadSpeed.value === 0) return '';
  
  const mbps = uploadSpeed.value / (1024 * 1024);
  return `${mbps.toFixed(2)} MB/s`;
};

// Methods
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

// Generate thumbnail from video
const generateThumbnail = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    isGeneratingThumbnail.value = true;
    
    // Create a video element
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    // Create object URL for the video file
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    
    // When video metadata is loaded
    video.onloadedmetadata = () => {
      // Seek to 25% of the video duration for the thumbnail
      video.currentTime = video.duration * 0.25;
    };
    
    // When the video is seeked to the desired time
    video.onseeked = () => {
      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate thumbnail'));
            return;
          }
          
          // Clean up
          URL.revokeObjectURL(objectUrl);
          isGeneratingThumbnail.value = false;
          
          // Create a thumbnail URL for preview
          thumbnailUrl.value = URL.createObjectURL(blob);
          
          resolve(blob);
        }, 'image/jpeg', 0.8);
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        isGeneratingThumbnail.value = false;
        reject(error);
      }
    };
    
    // Handle errors
    video.onerror = (error) => {
      console.error('Error loading video:', error);
      URL.revokeObjectURL(objectUrl);
      isGeneratingThumbnail.value = false;
      reject(error);
    };
    
    // Start loading the video
    video.load();
  });
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validVideoTypes.includes(file.type)) {
      videoStore.error.value = 'Please select a valid video file (MP4, WebM, OGG, or QuickTime)';
      return;
    }
    
    // Validate file size (max 500MB for now)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      videoStore.error.value = 'Video size should be less than 500MB';
      return;
    }
    
    videoFile.value = file;
    // Set title to file name without extension
    title.value = file.name.split('.').slice(0, -1).join('.');
    videoStore.error.value = null;
    
    // Generate thumbnail
    try {
      thumbnailBlob.value = await generateThumbnail(file);
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      // Continue without thumbnail if generation fails
      thumbnailBlob.value = null;
      thumbnailUrl.value = null;
    }
  }
};

const resetForm = () => {
  videoFile.value = null;
  title.value = '';
  description.value = '';
  categoryId.value = '';
  isPrivate.value = false;
  tagsInput.value = '';
  tagIds.value = [];
  successMessage.value = '';
  estimatedTimeRemaining.value = '';
  uploadSpeed.value = 0;
  videoStore.resetUploadProgress();
  
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const uploadVideo = async () => {
  if (!videoFile.value || !title.value) {
    videoStore.error.value = 'Please provide a video file and title';
    return;
  }
  
  if (!isAuthenticated.value) {
    videoStore.error.value = 'You must be logged in to upload videos';
    return;
  }
  
  try {
    // Reset any previous errors
    videoStore.error.value = null;
    successMessage.value = '';
    
    // Record start time for calculating upload speed
    startTime.value = Date.now();
    estimatedTimeRemaining.value = 'Calculating...';
    
    // Map isPrivate to VideoVisibility enum
    const visibility = isPrivate.value ? VideoVisibility.PRIVATE : VideoVisibility.PUBLIC;
    
    // Create FormData for the upload
    const formData = new FormData();
    formData.append('title', title.value);
    
    if (description.value) {
      formData.append('description', description.value);
    }
    
    if (visibility) {
      formData.append('visibility', visibility);
    }
    
    if (categoryId.value) {
      formData.append('categoryId', categoryId.value);
    }
    
    if (tagIds.value.length > 0) {
      tagIds.value.forEach((tagId, index) => {
        formData.append(`tagIds[${index}]`, tagId);
      });
    }
    
    // Append the video file
    formData.append('file', videoFile.value);
    
    // Append the thumbnail if available
    if (thumbnailBlob.value) {
      formData.append('thumbnail', thumbnailBlob.value, 'thumbnail.jpg');
    }
    
    // Upload the video using the video store
    const uploadedVideo = await videoStore.uploadVideo({
      title: title.value,
      description: description.value,
      visibility,
      file: videoFile.value,
      categoryId: categoryId.value || undefined,
      tagIds: tagIds.value.length > 0 ? tagIds.value : undefined,
      thumbnail: thumbnailBlob.value || undefined
    });
    
    successMessage.value = 'Video uploaded successfully! It will be processed shortly.';
    
    // If upload is successful, redirect to the video player page after a short delay
    if (uploadedVideo) {
      setTimeout(() => {
        router.push({
          name: 'video-watch',
          query: { id: uploadedVideo.id }
        });
      }, 2000);
    }
  } catch (err) {
    // Error is already handled by the store
    console.error('Upload failed:', err);
  }
};

// Process tags input
const processTags = () => {
  if (!tagsInput.value) return;
  
  // Split by commas and trim whitespace
  const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
  
  // Find matching tag IDs
  const availableTags = tagStore.tags.value;
  const foundTagIds: string[] = [];
  
  // First try to match existing tags
  tags.forEach(tagName => {
    const matchingTag = availableTags.find(t => 
      t.name.toLowerCase() === tagName.toLowerCase()
    );
    
    if (matchingTag) {
      foundTagIds.push(matchingTag.id);
    }
  });
  
  tagIds.value = foundTagIds;
};

// Watch for changes in tagsInput
watch(tagsInput, processTags);
</script>

<template>
  <div class="video-upload-form">
    <h2>Upload Video</h2>
    
    <div v-if="!isAuthenticated" class="auth-required">
      <p>You need to be logged in to upload videos.</p>
      <router-link to="/auth/login" class="login-btn">Log In</router-link>
    </div>
    
    <div v-else class="upload-container">
      <transition name="fade">
        <div v-if="error" class="error-message">
          <span class="error-icon">!</span>
          {{ error }}
        </div>
      </transition>
      
      <transition name="fade">
        <div v-if="successMessage" class="success-message">
          <span class="success-icon">✓</span>
          {{ successMessage }}
        </div>
      </transition>
      
      <div class="file-upload-area" :class="{ 'has-file': videoFile }" @click="triggerFileInput">
        <input
          ref="fileInputRef"
          type="file"
          accept="video/*"
          class="file-input"
          @change="handleFileChange"
        />
        
        <div v-if="!videoFile" class="upload-placeholder">
          <div class="upload-icon">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="48"
                 height="48"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2"
                 stroke-linecap="round"
                 stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12"
                    y1="3"
                    x2="12"
                    y2="15"/>
            </svg>
          </div>
          <p class="upload-text">Click to select a video file or drag and drop</p>
          <p class="upload-hint">MP4, WebM, OGG, or QuickTime (max 500MB)</p>
        </div>
        
        <div v-else class="file-preview">
          <div class="file-info">
            <div class="file-name">{{ videoFile.name }}</div>
            <div class="file-size">{{ formatFileSize(videoFile.size) }}</div>
            <div class="file-type">{{ videoFile.type }}</div>
          </div>
          <button class="change-file-btn" @click.stop="triggerFileInput">Change Video</button>
        </div>
      </div>
      
      <!-- Thumbnail Preview -->
      <div v-if="thumbnailUrl" class="thumbnail-preview">
        <h3>Video Thumbnail</h3>
        <div class="thumbnail-container">
          <img :src="thumbnailUrl" alt="Video thumbnail" class="thumbnail-image" />
          <div v-if="isGeneratingThumbnail" class="thumbnail-loading">
            <div class="thumbnail-spinner"/>
            <span>Generating thumbnail...</span>
          </div>
        </div>
        <p class="thumbnail-hint">This thumbnail will be used for your video</p>
      </div>
      
      <div class="form-fields">
        <div class="form-group">
          <label for="title">Title <span class="required">*</span></label>
          <input
            id="title"
            v-model="title"
            type="text"
            class="form-control"
            placeholder="Enter video title"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="description"
            class="form-control"
            placeholder="Enter video description"
            rows="4"
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" v-model="categoryId" class="form-control">
              <option value="">Select a category</option>
              <option
                v-for="category in categoryStore.categories.value"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="privacy">Privacy</label>
            <div class="privacy-toggle">
              <input
                id="privacy"
                v-model="isPrivate"
                type="checkbox"
                class="toggle-input"
              />
              <label for="privacy" class="toggle-label"/>
              <span class="privacy-label">{{ isPrivate ? 'Private' : 'Public' }}</span>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="tags">Tags</label>
          <input
            id="tags"
            v-model="tagsInput"
            type="text"
            class="form-control"
            placeholder="Enter tags separated by commas"
          />
          <small class="form-text">Separate tags with commas (e.g., music, rock, live)</small>
        </div>
        
        <div v-if="tagIds.length > 0" class="selected-tags">
          <div v-for="tagId in tagIds" :key="tagId" class="selected-tag">
            {{ tagStore.tags.value.find(t => t.id === tagId)?.name }}
          </div>
        </div>
      </div>
      
      <div v-if="isUploading" class="upload-progress">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"/>
        </div>
        <div class="progress-details">
          <div class="progress-text">
            <span v-if="uploadStatus === 'uploading'">
              {{ uploadProgress }}% Uploaded
            </span>
            <span v-else-if="uploadStatus === 'processing'">
              Processing...
            </span>
            <span v-else-if="uploadStatus === 'complete'">
              Upload Complete!
            </span>
          </div>
          <div v-if="uploadStatus === 'uploading' && uploadProgress > 0" class="upload-stats">
            <span v-if="uploadSpeed > 0" class="upload-speed">{{ formatUploadSpeed() }}</span>
            <span v-if="estimatedTimeRemaining" class="time-remaining">
              {{ estimatedTimeRemaining }} remaining
            </span>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button
          class="upload-btn"
          :disabled="!canSubmit || isUploading"
          @click="uploadVideo"
        >
          {{ isUploading ? 'Uploading...' : 'Upload Video' }}
        </button>
        <button
          class="cancel-btn"
          :disabled="isUploading"
          @click="resetForm"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-upload-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-primary, #1A2233);
}

.auth-required {
  text-align: center;
  padding: 3rem;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
}

.login-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary, #41A4FF);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
}

.upload-container {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 2rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.error-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-right: 0.5rem;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.success-icon {
  margin-right: 0.5rem;
  font-weight: bold;
}

.file-upload-area {
  border: 2px dashed var(--text-secondary, #67748B);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: border-color 0.3s, background-color 0.3s;
}

.file-upload-area:hover {
  border-color: var(--primary, #41A4FF);
  background-color: rgba(65, 164, 255, 0.05);
}

.file-upload-area.has-file {
  border-color: var(--primary, #41A4FF);
  background-color: rgba(65, 164, 255, 0.05);
}

.file-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  margin-bottom: 1rem;
  color: var(--text-secondary, #67748B);
}

.upload-text {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #1A2233);
}

.upload-hint {
  font-size: 0.9rem;
  color: var(--text-secondary, #67748B);
}

.file-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  text-align: left;
}

.file-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--text-primary, #1A2233);
}

.file-size, .file-type {
  font-size: 0.9rem;
  color: var(--text-secondary, #67748B);
}

.change-file-btn {
  background-color: transparent;
  border: 1px solid var(--primary, #41A4FF);
  color: var(--primary, #41A4FF);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.form-fields {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary, #1A2233);
}

.required {
  color: #dc3545;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: var(--primary, #41A4FF);
  outline: none;
}

textarea.form-control {
  resize: vertical;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #67748B);
}

.privacy-toggle {
  display: flex;
  align-items: center;
}

.toggle-input {
  display: none;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-label {
  background-color: var(--primary, #41A4FF);
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(26px);
}

.privacy-label {
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary, #67748B);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: -1rem;
  margin-bottom: 1.5rem;
}

.selected-tag {
  background-color: var(--primary, #41A4FF);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.upload-progress {
  margin-bottom: 2rem;
}

.progress-container {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary, #41A4FF);
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.9rem;
  color: var(--text-primary, #1A2233);
  font-weight: 500;
}

.upload-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #67748B);
}

.upload-speed {
  font-weight: 500;
}

.time-remaining {
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.upload-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.upload-btn:hover:not(:disabled) {
  background-color: #3490e6;
}

.upload-btn:disabled {
  background-color: #a8d1ff;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: var(--text-secondary, #67748B);
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  color: var(--text-primary, #1A2233);
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .video-upload-form {
    padding: 1rem;
  }
  
  .upload-container {
    padding: 1rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .progress-details {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .upload-stats {
    margin-top: 0.25rem;
  }
}

/* Thumbnail Preview */
.thumbnail-preview {
  margin-bottom: 2rem;
  background-color: rgba(65, 164, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.thumbnail-preview h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--text-primary, #1A2233);
}

.thumbnail-container {
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.thumbnail-image {
  width: 100%;
  display: block;
}

.thumbnail-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.thumbnail-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.thumbnail-hint {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary, #67748B);
  margin-top: 0.5rem;
}
</style>