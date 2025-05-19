<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { videoStore } from '@/entities/video';
import { VideoVisibility } from '@/entities/video';
import { categoryStore } from '@/entities/category';
import { tagStore } from '@/entities/tag';

export interface UploadMetadata {
  title: string;
  description: string;
  isPrivate: boolean;
  categoryId?: string;
  tagIds: string[];
}

export interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  metadata: UploadMetadata;
}

const router = useRouter();

const props = defineProps({
  maxFileSize: {
    type: Number,
    default: 1024 * 1024 * 500
  },
  allowedFileTypes: {
    type: Array as () => string[],
    default: () => ['video/mp4', 'video/webm', 'video/ogg']
  },
  multiple: {
    type: Boolean,
    default: false
  },
  uploading: {
    type: Boolean,
    default: false
  },
  uploadProgress: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['fileSelected', 'uploadStart', 'cancel', 'metadataChange']);

const fileInputRef = ref<HTMLInputElement | null>(null);
const dragActive = ref(false);
const selectedFile = ref<File | null>(null);
const metadata = ref<UploadMetadata>({
  title: '',
  description: '',
  isPrivate: false,
  categoryId: undefined,
  tagIds: []
});

// Use the video store for upload state
const uploading = computed(() => videoStore.uploadProgress.value.status === 'uploading' ||
                            videoStore.uploadProgress.value.status === 'processing');
const uploadProgress = computed(() => videoStore.uploadProgress.value.progress);
const error = computed(() => videoStore.error.value);

// Fetch categories and tags when component is mounted
onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    tagStore.fetchTags()
  ]);
});

// Reset upload progress when component is unmounted
onUnmounted(() => {
  videoStore.resetUploadProgress();
});

const isFileTooLarge = computed(() => {
  if (!selectedFile.value) return false;
  return selectedFile.value.size > props.maxFileSize;
});

const isFileTypeInvalid = computed(() => {
  if (!selectedFile.value) return false;
  return !props.allowedFileTypes.includes(selectedFile.value.type);
});

const isFileValid = computed(() => {
  return selectedFile.value && !isFileTooLarge.value && !isFileTypeInvalid.value;
});

const formattedFileSize = computed(() => {
  if (!selectedFile.value) return '';
  
  const bytes = selectedFile.value.size;
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
});

const maxFileSizeFormatted = computed(() => {
  const bytes = props.maxFileSize;
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
});

const allowedFileTypesDisplay = computed(() => {
  return props.allowedFileTypes.map(type => type.split('/')[1].toUpperCase()).join(', ');
});

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
    
    if (selectedFile.value) {
      metadata.value.title = selectedFile.value.name.split('.').slice(0, -1).join('.');
      emit('fileSelected', {
        file: selectedFile.value,
        metadata: { ...metadata.value }
      });
    }
  }
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  dragActive.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragActive.value = false;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragActive.value = false;
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    selectedFile.value = event.dataTransfer.files[0];
    
    if (selectedFile.value) {
      metadata.value.title = selectedFile.value.name.split('.').slice(0, -1).join('.');
      emit('fileSelected', {
        file: selectedFile.value,
        metadata: { ...metadata.value }
      });
    }
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleUploadStart = async () => {
  if (isFileValid.value && selectedFile.value) {
    try {
      // Map component's isPrivate to VideoVisibility enum
      const visibility = metadata.value.isPrivate
        ? VideoVisibility.PRIVATE
        : VideoVisibility.PUBLIC;
      
      // Upload the video using the video store
      const uploadedVideo = await videoStore.uploadVideo({
        title: metadata.value.title,
        description: metadata.value.description,
        visibility,
        file: selectedFile.value,
        categoryId: metadata.value.categoryId,
        tagIds: metadata.value.tagIds
      });
      
      // Emit the upload event for parent components
      emit('uploadStart', {
        file: selectedFile.value,
        metadata: { ...metadata.value }
      });
      
      // If upload is successful, redirect to the video page
      if (uploadedVideo) {
        setTimeout(() => {
          router.push(`/videos/${uploadedVideo.id}`);
        }, 1000);
      }
    } catch (err) {
      // Error is already handled by the store
      console.error('Upload failed:', err);
    }
  }
};

const handleCancel = () => {
  selectedFile.value = null;
  metadata.value = {
    title: '',
    description: '',
    isPrivate: false,
    categoryId: undefined,
    tagIds: []
  };
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
  emit('cancel');
};

const updateMetadata = () => {
  emit('metadataChange', { ...metadata.value });
};

watch(() => metadata.value, updateMetadata, { deep: true });
</script>

<template>
  <div class="video-upload">
    <div 
      v-if="!selectedFile"
      class="video-upload__dropzone"
      :class="{ 'video-upload__dropzone--active': dragActive }"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="video-upload__file-input"
        :accept="allowedFileTypes.join(',')"
        :multiple="multiple"
        @change="handleFileSelect"
      />
      
      <div class="video-upload__dropzone-content">
        <div class="video-upload__icon">
          <svg width="48"
               height="48"
               viewBox="0 0 24 24"
               fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L12 8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
            <path d="M9 11L12 8 15 11"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
            <path d="M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5661 2.83545 14.4371 4.18695 15.7935"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
            <path d="M8 16H16V20.5C16 21.3284 15.3284 22 14.5 22H9.5C8.67157 22 8 21.3284 8 20.5V16Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="video-upload__title">Drag and drop your video here</h3>
        <p class="video-upload__subtitle">or click to browse files</p>
        <p class="video-upload__info">
          Max file size: {{ maxFileSizeFormatted }} <br/>
          Supported formats: {{ allowedFileTypesDisplay }}
        </p>
      </div>
    </div>
    
    <div v-else class="video-upload__selected">
      <div class="video-upload__file-info">
        <h3 class="video-upload__file-name">{{ selectedFile.name }}</h3>
        <p class="video-upload__file-size">{{ formattedFileSize }}</p>
        
        <div v-if="isFileTooLarge" class="video-upload__error">
          File is too large. Maximum size is {{ maxFileSizeFormatted }}.
        </div>
        
        <div v-if="isFileTypeInvalid" class="video-upload__error">
          Invalid file type. Supported formats: {{ allowedFileTypesDisplay }}.
        </div>
      </div>
      
      <div class="video-upload__metadata">
        <div class="video-upload__form-group">
          <label for="video-title" class="video-upload__label">Title</label>
          <input
            id="video-title"
            v-model="metadata.title"
            type="text"
            class="video-upload__input"
            placeholder="Enter video title"
            :disabled="uploading"
          />
        </div>
        
        <div class="video-upload__form-group">
          <label for="video-description" class="video-upload__label">Description</label>
          <textarea
            id="video-description"
            v-model="metadata.description"
            class="video-upload__textarea"
            placeholder="Enter video description"
            rows="4"
            :disabled="uploading"
          />
        </div>
        
        <div class="video-upload__form-group">
          <label class="video-upload__checkbox-label">
            <input
              v-model="metadata.isPrivate"
              type="checkbox"
              class="video-upload__checkbox"
              :disabled="uploading"
            />
            <span class="video-upload__checkbox-text">Private video</span>
          </label>
        </div>

        <div class="video-upload__form-group">
          <label for="video-category" class="video-upload__label">Category</label>
          <select
            id="video-category"
            v-model="metadata.categoryId"
            class="video-upload__select"
            :disabled="uploading"
          >
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

        <div class="video-upload__form-group">
          <label class="video-upload__label">Tags</label>
          <div class="video-upload__tags">
            <div
              v-for="tag in tagStore.tags.value"
              :key="tag.id"
              class="video-upload__tag"
              :class="{ 'video-upload__tag--selected': metadata.tagIds.includes(tag.id) }"
              @click="() => {
                if (metadata.tagIds.includes(tag.id)) {
                  metadata.tagIds = metadata.tagIds.filter(id => id !== tag.id);
                } else {
                  metadata.tagIds.push(tag.id);
                }
              }"
            >
              {{ tag.name }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="uploading" class="video-upload__progress">
        <div class="video-upload__progress-bar">
          <div
            class="video-upload__progress-fill"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
        <div class="video-upload__progress-text">
          {{ videoStore.uploadProgress.value.status === 'processing' ? 'Processing...' : `Uploading... ${uploadProgress}%` }}
        </div>
      </div>
      
      <div v-if="error" class="video-upload__error">
        <div class="video-upload__error-icon">!</div>
        <span>{{ error }}</span>
      </div>
      
      <div class="video-upload__actions">
        <button
          v-if="!uploading"
          class="video-upload__button video-upload__button--cancel"
          @click="handleCancel"
        >
          Cancel
        </button>
        
        <button
          v-if="!uploading"
          class="video-upload__button video-upload__button--upload"
          :disabled="!isFileValid"
          @click="handleUploadStart"
        >
          Upload Video
        </button>
        
        <button
          v-else
          class="video-upload__button video-upload__button--cancel"
          @click="handleCancel"
        >
          Cancel Upload
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-upload {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.video-upload__dropzone {
  border: 2px dashed var(--text-secondary, #67748B);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--panel-bg, #E6F0FB);
}

.video-upload__dropzone:hover,
.video-upload__dropzone--active {
  border-color: var(--primary, #41A4FF);
  background-color: var(--hover-bg, #EAF9F7);
}

.video-upload__file-input {
  display: none;
}

.video-upload__dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.video-upload__icon {
  color: var(--primary, #41A4FF);
  margin-bottom: 8px;
}

.video-upload__title {
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: var(--text-primary, #1A2233);
}

.video-upload__subtitle {
  font-size: 16px;
  margin: 0;
  color: var(--text-secondary, #67748B);
}

.video-upload__info {
  font-size: 14px;
  margin: 8px 0 0;
  color: var(--text-secondary, #67748B);
}

.video-upload__selected {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
}

.video-upload__file-info {
  margin-bottom: 24px;
}

.video-upload__file-name {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 4px;
  color: var(--text-primary, #1A2233);
  word-break: break-word;
}

.video-upload__file-size {
  font-size: 14px;
  margin: 0;
  color: var(--text-secondary, #67748B);
}

.video-upload__metadata {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.video-upload__form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-upload__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1A2233);
}

.video-upload__input,
.video-upload__textarea,
.video-upload__select {
  padding: 12px;
  border: 1px solid var(--text-secondary, #67748B);
  border-radius: 4px;
  font-size: 16px;
  width: 100%;
  background-color: white;
  color: var(--text-primary, #1A2233);
}

.video-upload__input:focus,
.video-upload__textarea:focus,
.video-upload__select:focus {
  outline: none;
  border-color: var(--primary, #41A4FF);
}

.video-upload__checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.video-upload__checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.video-upload__checkbox-text {
  font-size: 14px;
  color: var(--text-primary, #1A2233);
}

.video-upload__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.video-upload__tag {
  padding: 6px 12px;
  border-radius: 16px;
  background-color: var(--panel-bg, #E6F0FB);
  color: var(--text-secondary, #67748B);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.video-upload__tag:hover {
  border-color: var(--primary, #41A4FF);
  color: var(--primary, #41A4FF);
}

.video-upload__tag--selected {
  background-color: var(--primary, #41A4FF);
  color: white;
}

.video-upload__tag--selected:hover {
  background-color: var(--secondary, #9067E6);
  color: white;
}

.video-upload__progress {
  margin-bottom: 24px;
}

.video-upload__progress-bar {
  height: 8px;
  background-color: rgba(65, 164, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.video-upload__progress-fill {
  height: 100%;
  background-color: var(--primary, #41A4FF);
  transition: width 0.3s ease;
}

.video-upload__progress-text {
  font-size: 14px;
  color: var(--text-secondary, #67748B);
  text-align: center;
}

.video-upload__error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--error, #FF677B);
  font-size: 14px;
  margin: 8px 0;
  padding: 8px 12px;
  background-color: rgba(255, 103, 123, 0.1);
  border-radius: 4px;
}

.video-upload__error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--error, #FF677B);
  color: white;
  font-weight: bold;
}

.video-upload__actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.video-upload__button {
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.video-upload__button--upload {
  background-color: var(--primary, #41A4FF);
  color: white;
}

.video-upload__button--upload:hover {
  background-color: var(--secondary, #9067E6);
}

.video-upload__button--upload:disabled {
  background-color: var(--text-secondary, #67748B);
  cursor: not-allowed;
}

.video-upload__button--cancel {
  background-color: transparent;
  color: var(--text-secondary, #67748B);
  border: 1px solid var(--text-secondary, #67748B);
}

.video-upload__button--cancel:hover {
  color: var(--text-primary, #1A2233);
  border-color: var(--text-primary, #1A2233);
}

@media (max-width: 768px) {
  .video-upload__dropzone {
    padding: 24px;
  }
  
  .video-upload__title {
    font-size: 18px;
  }
  
  .video-upload__subtitle {
    font-size: 14px;
  }
  
  .video-upload__actions {
    flex-direction: column-reverse;
  }
  
  .video-upload__button {
    width: 100%;
  }
}
</style>