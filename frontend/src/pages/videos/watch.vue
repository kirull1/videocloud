<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videoStore, VideoStatus, VideoVisibility } from '@/entities/video';
import { VideoPlayer } from '@/entities/video/ui';
import { CommentSection } from '@/features/comments/ui';

const route = useRoute();
const router = useRouter();
const videoId = computed(() => route.query.id as string);
const isLoading = ref(false);
const error = ref<string | null>(null);

const video = computed(() => {
  return videoStore.currentVideo.value;
});

const isVideoReady = computed(() => 
  video.value?.status === VideoStatus.READY
);

const formattedDate = computed(() => {
  if (!video.value) return '';
  return new Date(video.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

watch(videoId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    try {
      isLoading.value = true;
      await videoStore.fetchVideo(newId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load video';
    } finally {
      isLoading.value = false;
    }
  }
}, { immediate: true });

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
          :poster="video.thumbnailUrl"
        />
      </div>
      
      <div class="video-page__content">
        <div class="video-page__header">
          <h1 class="video-page__title">{{ video.title }}</h1>
          
          <div class="video-page__meta">
            <span class="video-page__views">{{ formattedViews }}</span>
            <span class="video-page__date">{{ formattedDate }}</span>
          </div>
        </div>
        
        <div class="video-page__uploader">
          <img
            :src="video.userAvatarUrl || `/api/users/${video.userId}/avatar`"
            alt="Channel avatar"
            class="video-page__uploader-avatar"
            @click="navigateToChannel"
          />
          <div class="video-page__uploader-info">
            <h3 class="video-page__uploader-name" @click="navigateToChannel">
              {{ video.channelName || video.username }}
            </h3>
            <div v-if="video.channelId" class="video-page__channel-link" @click="navigateToChannel">
              View channel
            </div>
          </div>
        </div>
        
        <div v-if="video.description" class="video-page__description">
          <h3 class="video-page__description-title">Description</h3>
          <p class="video-page__description-text">{{ video.description }}</p>
        </div>
        
        <!-- Comments Section -->
        <div :class="['video-page__comments', { 'video-page__comments--no-description': !video.description }]">
          <CommentSection :video-id="video.id" />
        </div>
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
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.video-page__uploader-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(65, 164, 255, 0.5);
}

.video-page__uploader-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px;
  color: var(--text-primary, #1A2233);
  cursor: pointer;
}

.video-page__uploader-name:hover {
  color: var(--primary, #41A4FF);
}

.video-page__channel-link {
  font-size: 14px;
  color: var(--primary, #41A4FF);
  cursor: pointer;
}

.video-page__channel-link:hover {
  text-decoration: underline;
}

.video-page__description-title {
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
  margin: 0;
}

.video-page__comments {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(103, 116, 139, 0.2);
}

.video-page__comments--no-description {
  border-top: none;
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
}
</style>