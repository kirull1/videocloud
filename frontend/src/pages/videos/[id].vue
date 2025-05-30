<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videoStore, VideoStatus, VideoVisibility } from '@/entities/video';
import { VideoPlayer } from '@/entities/video/ui';
import { CommentSection } from '@/features/comments';
import { ReactionButtons } from '@/features/reactions';
import { getAvatarUrl } from '@/shared/lib/avatar';

// Declare localStorage for TypeScript
declare const localStorage: Storage;

const route = useRoute();
const router = useRouter();
const videoId = computed(() => route.params.id as string);
const isLoading = computed(() => videoStore.isLoading.value);
const error = ref<string | null>(null);

// Get the current video from the store
const video = computed(() => videoStore.currentVideo.value);

// Calculate avatar URL using the shared utility
const avatarUrl = computed(() => {
  if (!video.value) return '';
  return getAvatarUrl(video.value.userAvatarUrl, video.value.username, 48);
});

// Check if the video is ready to play
const isVideoReady = computed(() => 
  video.value?.status === VideoStatus.READY
);

// Format the video upload date
const formattedDate = computed(() => {
  if (!video.value) return '';
  return new Date(video.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Format the video visibility
const visibilityText = computed(() => {
  if (!video.value) return '';
  
  switch (video.value.visibility) {
    case VideoVisibility.PUBLIC:
      return 'Public';
    case VideoVisibility.PRIVATE:
      return 'Private';
    case VideoVisibility.UNLISTED:
      return 'Unlisted';
    default:
      return '';
  }
});

// Format the video views
const formattedViews = computed(() => {
  if (!video.value) return '0 views';
  
  const views = video.value.views;
  if (views === 0) return '0 views';
  if (views === 1) return '1 view';
  
  if (views < 1000) return `${views} views`;
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K views`;
  return `${(views / 1000000).toFixed(1)}M views`;
});

// Handle video deletion
const handleDelete = async () => {
  if (!video.value) return;
  
  if (confirm('Are you sure you want to delete this video?')) {
    try {
      await videoStore.deleteVideo(video.value.id);
      router.push('/');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete video';
    }
  }
};

// Navigate to channel page
const navigateToChannel = (event: Event) => {
  event.stopPropagation();
  
  if (video.value?.channelId) {
    router.push({
      name: 'channel-detail',
      params: { id: video.value.channelId }
    });
  } else if (video.value?.userId) {
    // If we have userId but no channelId, we need to first get the channel for this user
    console.log('Looking for channel for user:', video.value.userId);
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    
    // Get channels and filter by userId on the client side
    fetch(`${baseUrl}/channels`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        return response.json();
      })
      .then(channels => {
        // Find the channel that belongs to this user
        const userChannel = channels.find((channel: any) => channel.userId === video.value?.userId);
        
        if (userChannel) {
          console.log('Found channel:', userChannel);
          router.push({
            name: 'channel-detail',
            params: { id: userChannel.id }
          });
        } else {
          console.error('No channel found for user:', video.value?.userId);
        }
      })
      .catch(error => {
        console.error('Error fetching channel for user:', error);
      });
  }
};

// Fetch the video when the component is mounted
onMounted(async () => {
  try {
    await videoStore.fetchVideo(videoId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load video';
  }
});
</script>

<template>
  <div class="video-page">    
    <div v-if="isLoading && !video" class="video-page__loading">
      <div class="video-page__loading-spinner"/>
      <p>Loading video...</p>
    </div>
    
    <div v-else-if="error" class="video-page__error">
      <div class="video-page__error-icon">!</div>
      <p>{{ error }}</p>
      <button class="video-page__back-button" @click="router.push('/')">
        Back to Home
      </button>
    </div>
    
    <template v-else-if="video">
      <div class="video-page__player-container">
        <div v-if="!isVideoReady" class="video-page__processing">
          <div class="video-page__processing-icon">
            <svg width="48"
                 height="48"
                 viewBox="0 0 24 24"
                 fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
              <path d="M12 6V12L16 14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Video Processing</h3>
          <p>Your video is currently being processed. This may take a few minutes.</p>
        </div>
        
        <VideoPlayer
          v-else
          :video-id="video.id"
          :poster="video.thumbnailUrl"
        />
      </div>
      
      <div class="video-page__content">
        <div class="video-page__header">
          <h1 class="video-page__title">{{ video.title }}</h1>
          
          <div class="video-page__meta">
            <span class="video-page__views">{{ formattedViews }}</span>
            <span class="video-page__date">{{ formattedDate }}</span>
            <span class="video-page__visibility" :class="`video-page__visibility--${video.visibility}`">
              {{ visibilityText }}
            </span>
          </div>
        </div>
        
        <div class="video-page__reactions">
          <ReactionButtons :video-id="video.id" />
        </div>
        
        <div class="video-page__actions">
          <button 
            v-if="video.userId === localStorage.getItem('userId')"
            class="video-page__action-button video-page__action-button--edit"
            @click="router.push(`/videos/${video.id}/edit`)"
          >
            Edit Video
          </button>
          
          <button 
            v-if="video.userId === localStorage.getItem('userId')"
            class="video-page__action-button video-page__action-button--delete"
            @click="handleDelete"
          >
            Delete Video
          </button>
        </div>
        
        <div class="video-page__uploader">
          <img 
            :src="avatarUrl" 
            alt="Uploader avatar" 
            class="video-page__uploader-avatar"
            @click="navigateToChannel"
          />
          <div class="video-page__uploader-info">
            <h3 class="video-page__uploader-name" @click="navigateToChannel">{{ video.username }}</h3>
          </div>
        </div>
        
        <div v-if="video.category" class="video-page__category">
          <h3 class="video-page__section-title">Category</h3>
          <div class="video-page__category-badge">
            {{ video.category.name }}
          </div>
        </div>
        
        <div v-if="video.tags && video.tags.length > 0" class="video-page__tags">
          <h3 class="video-page__section-title">Tags</h3>
          <div class="video-page__tags-container">
            <span
              v-for="tag in video.tags"
              :key="tag.id"
              class="video-page__tag"
            >
              #{{ tag.name }}
            </span>
          </div>
        </div>
        
        <div v-if="video.description" class="video-page__description">
          <h3 class="video-page__section-title">Description</h3>
          <p class="video-page__description-text">{{ video.description }}</p>
        </div>
        
        <!-- Comments Section -->
        <CommentSection :video-id="video.id" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.video-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.video-page__loading,
.video-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.video-page__loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(65, 164, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary, #41A4FF);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.video-page__error-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--error, #FF677B);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.video-page__back-button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.video-page__back-button:hover {
  background-color: var(--secondary, #9067E6);
}

.video-page__player-container {
  width: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-page__processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 24px;
}

.video-page__processing-icon {
  color: var(--primary, #41A4FF);
  margin-bottom: 16px;
}

.video-page__content {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
}

.video-page__header {
  margin-bottom: 16px;
}

.video-page__title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--text-primary, #1A2233);
}

.video-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--text-secondary, #67748B);
  font-size: 14px;
}

.video-page__visibility {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.video-page__visibility--public {
  background-color: var(--success, #8FF6E9);
  color: #155724;
}

.video-page__visibility--private {
  background-color: var(--error, #FF677B);
  color: white;
}

.video-page__visibility--unlisted {
  background-color: var(--text-secondary, #67748B);
  color: white;
}

.video-page__reactions {
  margin-bottom: 16px;
}

.video-page__actions {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.video-page__action-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.video-page__action-button--edit {
  background-color: var(--primary, #41A4FF);
  color: white;
}

.video-page__action-button--edit:hover {
  background-color: var(--secondary, #9067E6);
}

.video-page__action-button--delete {
  background-color: transparent;
  color: var(--error, #FF677B);
  border: 1px solid var(--error, #FF677B);
}

.video-page__action-button--delete:hover {
  background-color: var(--error, #FF677B);
  color: white;
}

.video-page__uploader {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(103, 116, 139, 0.2);
}

.video-page__uploader-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 16px;
  cursor: pointer;
}

.video-page__uploader-info {
  display: flex;
  flex-direction: column;
}

.video-page__uploader-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1A2233);
  cursor: pointer;
}

.video-page__uploader-name:hover {
  color: var(--primary, #41A4FF);
}

.video-page__section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px;
  color: var(--text-primary, #1A2233);
}

.video-page__description-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary, #1A2233);
  white-space: pre-wrap;
}

.video-page__category {
  margin-bottom: 16px;
}

.video-page__category-badge {
  display: inline-block;
  padding: 4px 10px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.video-page__tags {
  margin-bottom: 16px;
}

.video-page__tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.video-page__tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: rgba(65, 164, 255, 0.1);
  color: var(--primary, #41A4FF);
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.video-page__tag:hover {
  background-color: rgba(65, 164, 255, 0.2);
}

@media (max-width: 768px) {
  .video-page {
    padding: 16px;
  }
  
  .video-page__title {
    font-size: 20px;
  }
  
  .video-page__meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .video-page__actions {
    flex-direction: column;
  }
  
  .video-page__action-button {
    width: 100%;
  }
}
</style>