import { ref, computed } from 'vue';
import { videoApi } from '../api/videoApi';
import { VideoStatus, VideoVisibility } from './types';
import type { Video, VideoUploadProgress } from './types';
import type { Category } from '@/entities/category';

// State
const videos = ref<Video[]>([]);
const currentVideo = ref<Video | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const totalVideos = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);
const uploadProgress = ref<VideoUploadProgress>({
  progress: 0,
  status: 'idle',
});

// Getters
const isVideoReady = computed(() => 
  currentVideo.value?.status === VideoStatus.READY
);

const userVideos = computed(() => 
  videos.value.filter(video => video.userId === localStorage.getItem('userId'))
);

const publicVideos = computed(() => 
  videos.value.filter(video => 
    video.visibility === VideoVisibility.PUBLIC && 
    video.status === VideoStatus.READY
  )
);

// Helper function to transform API response to Video type
const transformVideoResponse = (videoResponse: any): Video => {
  // Transform category if it exists
  let category: Category | undefined = undefined;
  if (videoResponse.category) {
    category = {
      id: videoResponse.category.id,
      name: videoResponse.category.name,
      slug: videoResponse.category.slug,
      description: videoResponse.category.description,
      iconUrl: videoResponse.category.iconUrl,
      order: videoResponse.category.order || 0, // Default to 0 if not provided
      createdAt: videoResponse.category.createdAt || videoResponse.createdAt, // Default to video createdAt
      updatedAt: videoResponse.category.updatedAt || videoResponse.updatedAt, // Default to video updatedAt
    };
  }

  // Return transformed video
  return {
    ...videoResponse,
    category,
  };
};

// Actions
async function fetchVideos(params = {}) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await videoApi.getVideos(params);
    
    // Transform each video in the response
    videos.value = response.items.map(transformVideoResponse);
    totalVideos.value = response.total;
    currentPage.value = response.page;
    totalPages.value = response.totalPages;
    
    return response;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch videos';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function fetchVideo(id: string) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const videoResponse = await videoApi.getVideo(id);
    const video = transformVideoResponse(videoResponse);
    currentVideo.value = video;
    
    return video;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch video';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function uploadVideo(data: {
  title: string;
  description?: string;
  visibility?: VideoVisibility;
  file: File;
  categoryId?: string;
  tagIds?: string[];
  thumbnail?: Blob;
}) {
  try {
    // Reset upload progress
    uploadProgress.value = {
      progress: 0,
      status: 'uploading',
    };
    
    error.value = null;
    
    // Upload the video using the video API with progress tracking
    const videoResponse = await videoApi.uploadVideo(data, (progress) => {
      // Update progress state
      uploadProgress.value.progress = progress;
    });
    
    // Transform the response
    const video = transformVideoResponse(videoResponse);
    
    // Set progress to complete
    uploadProgress.value = {
      progress: 100,
      status: 'complete',
    };
    
    // Add the new video to the videos list
    videos.value = [video, ...videos.value];
    
    return video;
  } catch (err) {
    uploadProgress.value = {
      progress: 0,
      status: 'error',
      error: err instanceof Error ? err.message : 'Failed to upload video',
    };
    
    error.value = uploadProgress.value.error || 'Unknown error';
    throw err;
  }
}

async function updateVideo(id: string, data: {
  title?: string;
  description?: string;
  visibility?: VideoVisibility;
  categoryId?: string;
  tagIds?: string[];
}) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const videoResponse = await videoApi.updateVideo(id, data);
    const video = transformVideoResponse(videoResponse);
    
    // Update the video in the videos list
    const index = videos.value.findIndex(v => v.id === id);
    if (index !== -1) {
      videos.value[index] = video;
    }
    
    // Update current video if it's the one being edited
    if (currentVideo.value?.id === id) {
      currentVideo.value = video;
    }
    
    return video;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update video';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function deleteVideo(id: string) {
  try {
    isLoading.value = true;
    error.value = null;
    
    await videoApi.deleteVideo(id);
    
    // Remove the video from the videos list
    videos.value = videos.value.filter(v => v.id !== id);
    
    // Clear current video if it's the one being deleted
    if (currentVideo.value?.id === id) {
      currentVideo.value = null;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete video';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

function resetUploadProgress() {
  uploadProgress.value = {
    progress: 0,
    status: 'idle',
  };
}

// Export the store
export const videoStore = {
  // State
  videos,
  currentVideo,
  isLoading,
  error,
  totalVideos,
  currentPage,
  totalPages,
  uploadProgress,
  
  // Getters
  isVideoReady,
  userVideos,
  publicVideos,
  
  // Actions
  fetchVideos,
  fetchVideo,
  uploadVideo,
  updateVideo,
  deleteVideo,
  resetUploadProgress,
};