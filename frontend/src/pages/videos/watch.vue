<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videoStore, VideoStatus, VideoVisibility } from '@/entities/video';
import { VideoPlayer } from '@/entities/video/ui';
import { CommentSection } from '@/features/comments/ui';
import { getAvatarUrl } from '@/shared/lib/avatar';
import { userStore } from '@/features/auth/model/userStore';

const route = useRoute();
const router = useRouter();
const videoId = computed(() => route.query.id as string);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Subscription state
const isSubscribed = ref(false);
const isSubscribing = ref(false);

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

// Calculate avatar URL using the shared utility
const avatarUrl = computed(() => {
  if (!video.value) return '';
  return getAvatarUrl(video.value.userAvatarUrl, video.value.username || video.value.channelName || 'User', 48);
});

// Check if the user is authenticated
const isAuthenticated = computed(() => userStore.isAuthenticated.value);

// Check if the current user is the video owner
const isVideoOwner = computed(() => {
  if (!video.value || !isAuthenticated.value) return false;
  return video.value.userId === localStorage.getItem('userId');
});

// Format numbers for display (views, subscribers)
const formatNumber = (num: number): string => {
  if (!num) return '0';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Handle subscribe/unsubscribe
const handleSubscribe = async (event: Event) => {
  event.stopPropagation();
  
  if (!isAuthenticated.value) {
    router.push('/auth/login');
    return;
  }
  
  if (!video.value?.channelId) {
    console.error('No channel ID available');
    return;
  }
  
  try {
    isSubscribing.value = true;
    
    // API call would go here
    // await channelApi.subscribeToChannel(video.value.channelId);
    
    // For now, just toggle the state
    isSubscribed.value = !isSubscribed.value;
    
    // Update channel subscriber count
    if (video.value) {
      if (isSubscribed.value) {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'video-page__success-message';
        successMessage.textContent = 'Subscribed to channel';
        document.body.appendChild(successMessage);
        
        // Remove the success message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
      } else {
        // Show unsubscribed message
        const successMessage = document.createElement('div');
        successMessage.className = 'video-page__success-message';
        successMessage.textContent = 'Unsubscribed from channel';
        document.body.appendChild(successMessage);
        
        // Remove the success message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
      }
    }
  } catch (err) {
    console.error('Failed to subscribe/unsubscribe:', err);
  } finally {
    isSubscribing.value = false;
  }
};

// Fetch subscription status
const fetchSubscriptionStatus = async () => {
  if (!isAuthenticated.value || !video.value?.channelId) return;
  
  // In a real app, this would be an API call
  // const response = await channelApi.getSubscriptionStatus(video.value.channelId);
  // isSubscribed.value = response.isSubscribed;
  
  // For now, just set a default value
  isSubscribed.value = false;
};

watch(videoId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    try {
      isLoading.value = true;
      await videoStore.fetchVideo(newId);
      
      // Once we have the video, check subscription status
      await fetchSubscriptionStatus();
      
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
          </div>
        </div>
        
        <div class="video-page__uploader">
          <img
            :src="avatarUrl"
            alt="Uploader avatar"
            class="video-page__uploader-avatar"
            @click="navigateToChannel"
          />
          <div class="video-page__uploader-info">
            <h3 class="video-page__uploader-name" @click="navigateToChannel">
              {{ video.username }}
            </h3>
            <div v-if="video.channelId" class="video-page__uploader-subscribers">
              {{ formatNumber(0) }} subscribers
            </div>
          </div>
          <button 
            v-if="isAuthenticated && !isVideoOwner && video.channelId" 
            class="video-page__subscribe-button"
            :class="{ 'subscribed': isSubscribed }"
            :disabled="isSubscribing"
            @click="handleSubscribe"
          >
            {{ isSubscribed ? 'Unsubscribe' : 'Subscribe' }}
          </button>
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
  margin-top: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color, rgba(26, 34, 51, 0.1));
}

.video-page__uploader-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 16px;
  cursor: pointer;
}

.video-page__uploader-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(65, 164, 255, 0.5);
}

.video-page__uploader-info {
  flex-grow: 1;
}

.video-page__uploader-name {
  font-weight: 600;
  margin: 0;
  cursor: pointer;
}

.video-page__uploader-name:hover {
  color: var(--primary, #41A4FF);
}

.video-page__uploader-subscribers {
  font-size: 14px;
  color: var(--text-secondary, #67748B);
  margin-top: 4px;
}

.video-page__subscribe-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background-color: var(--primary, #41A4FF);
  color: white;
}

.video-page__subscribe-button:hover {
  background-color: var(--secondary, #9067E6);
}

.video-page__subscribe-button.subscribed {
  background-color: var(--panel-bg, #E6F0FB);
  color: var(--text-primary, #1A2233);
  border: 1px solid rgba(103, 116, 139, 0.3);
}

.video-page__subscribe-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Success message */
.video-page__success-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--success, #8FF6E9);
  color: #155724;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
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