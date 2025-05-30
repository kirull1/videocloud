<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videoStore, VideoStatus, VideoVisibility } from '@/entities/video';
import { VideoPlayer } from '@/entities/video/ui';
import { userStore } from '@/features/auth/model/userStore';
import { getAvatarUrl } from '@/shared/lib/avatar';
import { subscriptionApi } from '@/features/subscriptions';

interface Comment {
  id: string;
  text: string;
  userId: string | null;
  username: string;
  userAvatarUrl?: string;
  createdAt: string;
}

interface RelatedVideo {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  username: string;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();
const videoId = computed(() => route.query.id as string);
const isLoading = computed(() => videoStore.isLoading.value);
const error = ref<string | null>(null);
const relatedVideos = ref<RelatedVideo[]>([]);
const isLoadingRelated = ref(false);

// Comments
const comments = ref<Comment[]>([]);
const newComment = ref('');
const isSubmittingComment = ref(false);

// Likes
const likeCount = ref(0);
const dislikeCount = ref(0);
const userLiked = ref(false);
const userDisliked = ref(false);

// Playback settings
const playbackRate = ref(1);
const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const isFullscreen = ref(false);
const showSettings = ref(false);
const videoElement = ref<HTMLVideoElement | null>(null);

// Subscription state
const isSubscribed = ref(false);
const isSubscribing = ref(false);
const subscriberCount = ref(0);

// Get the current video from the store
const video = computed(() => videoStore.currentVideo.value);

// Calculate avatar URL using the shared utility
const avatarUrl = computed(() => {
  if (!video.value) return '';
  return getAvatarUrl(video.value.userAvatarUrl, video.value.username, 48);
});

// Calculate user's avatar URL for comment form
const userAvatarUrl = computed(() => {
  return userStore.user.value?.avatarUrl 
    ? getAvatarUrl(userStore.user.value.avatarUrl, userStore.username.value, 40)
    : '/api/users/avatar';
});

// Get commenter avatar URL
const getCommenterAvatarUrl = (comment: Comment): string => {
  return getAvatarUrl(comment.userAvatarUrl, comment.username, 40);
};

// Check if the video is ready to play
const isVideoReady = computed(() => 
  video.value?.status === VideoStatus.READY
);

// Check if the current user is the video owner
const isVideoOwner = computed(() => 
  video.value?.userId === localStorage.getItem('userId')
);

// Check if user is authenticated
const isAuthenticated = computed(() => 
  userStore.isAuthenticated.value
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

// Format video duration
const formatDuration = (seconds: number): string => {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

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

// Handle like/dislike
const handleLike = () => {
  if (userLiked.value) {
    userLiked.value = false;
    likeCount.value--;
  } else {
    userLiked.value = true;
    likeCount.value++;
    
    if (userDisliked.value) {
      userDisliked.value = false;
      dislikeCount.value--;
    }
  }
};

const handleDislike = () => {
  if (userDisliked.value) {
    userDisliked.value = false;
    dislikeCount.value--;
  } else {
    userDisliked.value = true;
    dislikeCount.value++;
    
    if (userLiked.value) {
      userLiked.value = false;
      likeCount.value--;
    }
  }
};

// Handle comment submission
const submitComment = () => {
  if (!newComment.value.trim() || !video.value) return;
  
  isSubmittingComment.value = true;
  
  // Simulate API call
  setTimeout(() => {
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.value,
      userId: localStorage.getItem('userId'),
      username: userStore.user.value?.username || 'Anonymous',
      userAvatarUrl: userStore.user.value?.avatarUrl,
      createdAt: new Date().toISOString()
    };
    
    comments.value.unshift(comment);
    newComment.value = '';
    isSubmittingComment.value = false;
  }, 500);
};

// Handle playback rate change
const changePlaybackRate = (rate: number): void => {
  playbackRate.value = rate;
  if (videoElement.value) {
    videoElement.value.playbackRate = rate;
  }
  showSettings.value = false;
};

// Handle fullscreen toggle
const toggleFullscreen = () => {
  const container = document.querySelector('.video-player-container');
  
  if (!container) return;
  
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
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

// Listen for fullscreen change
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

// Fetch related videos
const fetchRelatedVideos = async () => {
  if (!video.value) return;
  
  isLoadingRelated.value = true;
  
  try {
    // In a real app, you would fetch related videos based on the current video
    // For now, we'll just fetch the latest videos
    const response = await videoStore.fetchVideos({
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    
    // Filter out the current video
    if (video.value) {
      relatedVideos.value = response.items
        .filter((v: any) => v.id !== video.value?.id)
        .slice(0, 4)
        .map((v: any) => ({
          id: v.id,
          title: v.title,
          thumbnailUrl: v.thumbnailUrl,
          duration: v.duration,
          views: v.views,
          username: v.username,
          createdAt: v.createdAt
        }));
    }
  } catch (err) {
    console.error('Failed to fetch related videos:', err);
  } finally {
    isLoadingRelated.value = false;
  }
};

// Fetch subscription status
const fetchSubscriptionStatus = async () => {
  if (!isAuthenticated.value || !video.value?.channelId) return;
  
  try {
    const { isSubscribed: status } = await subscriptionApi.checkSubscriptionStatus(video.value.channelId);
    isSubscribed.value = status;
    
    // Also fetch subscriber count
    fetchSubscriberCount();
  } catch (err) {
    console.error('Failed to check subscription status:', err);
  }
};

// Fetch subscriber count
const fetchSubscriberCount = async () => {
  if (!video.value?.channelId) return;
  
  try {
    const count = await subscriptionApi.getSubscriberCount(video.value.channelId);
    subscriberCount.value = count;
  } catch (err) {
    console.error('Failed to fetch subscriber count:', err);
  }
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
    
    if (isSubscribed.value) {
      await subscriptionApi.unsubscribeFromChannel(video.value.channelId);
      isSubscribed.value = false;
      if (subscriberCount.value > 0) subscriberCount.value--;
      
      // Show unsubscribed message
      const successMessage = document.createElement('div');
      successMessage.className = 'video-player-page__success-message';
      successMessage.textContent = 'Unsubscribed from channel';
      document.body.appendChild(successMessage);
      
      // Remove the success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } else {
      await subscriptionApi.subscribeToChannel(video.value.channelId);
      isSubscribed.value = true;
      subscriberCount.value++;
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'video-player-page__success-message';
      successMessage.textContent = 'Subscribed to channel';
      document.body.appendChild(successMessage);
      
      // Remove the success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    }
  } catch (err) {
    console.error('Failed to subscribe/unsubscribe:', err);
  } finally {
    isSubscribing.value = false;
  }
};

// Format number (views, subscribers)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Fetch the video when the component is mounted or videoId changes
watch(videoId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    try {
      await videoStore.fetchVideo(newId);
      
      // Initialize like/dislike counts (in a real app, these would come from the API)
      likeCount.value = Math.floor(Math.random() * 1000);
      dislikeCount.value = Math.floor(Math.random() * 200);
      
      // Check subscription status
      await fetchSubscriptionStatus();
      
      // Fetch related videos
      fetchRelatedVideos();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load video';
    }
  }
}, { immediate: true });
</script>

<template>
  <div class="video-player-page">
    <div v-if="isLoading && !video" class="video-player-page__loading">
      <div class="video-player-page__loading-spinner"/>
      <p>Loading video...</p>
    </div>
    
    <div v-else-if="error" class="video-player-page__error">
      <div class="video-player-page__error-icon">!</div>
      <p>{{ error }}</p>
      <button class="video-player-page__back-button" @click="router.push('/')">
        Back to Home
      </button>
    </div>
    
    <template v-else-if="video">
      <div class="video-player-page__main">
        <div class="video-player-container">
          <div v-if="!isVideoReady" class="video-player-page__processing">
            <div class="video-player-page__processing-icon">
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
            ref="videoElement"
            :src="`/api/videos/${video.id}/stream`"
            :poster="video.thumbnailUrl"
          />
          
          <div v-if="isVideoReady" class="video-player-controls">
            <div class="video-player-controls__left">
              <button class="video-player-controls__button" @click="handleLike">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" 
                     height="24" 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="currentColor" 
                     stroke-width="2" 
                     stroke-linecap="round" 
                     stroke-linejoin="round"
                     :class="{ 'active': userLiked }">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                <span>{{ likeCount }}</span>
              </button>
              
              <button class="video-player-controls__button" @click="handleDislike">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     width="24" 
                     height="24" 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="currentColor" 
                     stroke-width="2" 
                     stroke-linecap="round" 
                     stroke-linejoin="round"
                     :class="{ 'active': userDisliked }">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                </svg>
                <span>{{ dislikeCount }}</span>
              </button>
            </div>
            
            <div class="video-player-controls__right">
              <div class="video-player-controls__settings">
                <button class="video-player-controls__button" @click="showSettings = !showSettings">
                  <svg xmlns="http://www.w3.org/2000/svg" 
                       width="24" 
                       height="24" 
                       viewBox="0 0 24 24" 
                       fill="none" 
                       stroke="currentColor" 
                       stroke-width="2" 
                       stroke-linecap="round" 
                       stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </button>
                
                <div v-if="showSettings" class="video-player-controls__settings-menu">
                  <div class="video-player-controls__settings-header">
                    <h4>Playback Speed</h4>
                  </div>
                  <div class="video-player-controls__settings-options">
                    <button 
                      v-for="rate in playbackRates" 
                      :key="rate" 
                      class="video-player-controls__settings-option"
                      :class="{ 'active': playbackRate === rate }"
                      @click="changePlaybackRate(rate)"
                    >
                      {{ rate === 1 ? 'Normal' : rate + 'x' }}
                    </button>
                  </div>
                </div>
              </div>
              
              <button class="video-player-controls__button" @click="toggleFullscreen">
                <svg v-if="!isFullscreen" 
                     xmlns="http://www.w3.org/2000/svg" 
                     width="24" 
                     height="24" 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="currentColor" 
                     stroke-width="2" 
                     stroke-linecap="round" 
                     stroke-linejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                <svg v-else
                     xmlns="http://www.w3.org/2000/svg" 
                     width="24" 
                     height="24" 
                     viewBox="0 0 24 24" 
                     fill="none" 
                     stroke="currentColor" 
                     stroke-width="2" 
                     stroke-linecap="round" 
                     stroke-linejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="video-player-page__content">
          <div class="video-player-page__header">
            <h1 class="video-player-page__title">{{ video.title }}</h1>
            
            <div class="video-player-page__meta">
              <span class="video-player-page__views">{{ formattedViews }}</span>
              <span class="video-player-page__date">{{ formattedDate }}</span>
              <span class="video-player-page__visibility" :class="`video-player-page__visibility--${video.visibility}`">
                {{ visibilityText }}
              </span>
            </div>
          </div>
          
          <div class="video-player-page__actions">
            <button 
              v-if="isVideoOwner"
              class="video-player-page__action-button video-player-page__action-button--edit"
              @click="router.push(`/videos/${video.id}/edit`)"
            >
              Edit Video
            </button>
            
            <button 
              v-if="isVideoOwner"
              class="video-player-page__action-button video-player-page__action-button--delete"
              @click="handleDelete"
            >
              Delete Video
            </button>
            
            <button class="video-player-page__action-button video-player-page__action-button--share">
              <svg xmlns="http://www.w3.org/2000/svg" 
                   width="16" 
                   height="16" 
                   viewBox="0 0 24 24" 
                   fill="none" 
                   stroke="currentColor" 
                   stroke-width="2" 
                   stroke-linecap="round" 
                   stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59"
                      y1="13.51"
                      x2="15.42"
                      y2="17.49"/>
                <line x1="15.41"
                      y1="6.51"
                      x2="8.59"
                      y2="10.49"/>
              </svg>
              Share
            </button>
          </div>
          
          <div class="video-player-page__uploader">
            <img 
              :src="avatarUrl" 
              alt="Uploader avatar" 
              class="video-player-page__uploader-avatar"
              @click="navigateToChannel"
            />
            <div class="video-player-page__uploader-info">
              <h3 class="video-player-page__uploader-name" @click="navigateToChannel">{{ video.username }}</h3>
              <div v-if="video.channelId" class="video-player-page__uploader-subscribers">
                {{ formatNumber(subscriberCount) }} subscribers
              </div>
            </div>
            <button 
              v-if="isAuthenticated && !isVideoOwner && video.channelId" 
              class="video-player-page__subscribe-button"
              :class="{ 'subscribed': isSubscribed }"
              :disabled="isSubscribing"
              @click="handleSubscribe"
            >
              {{ isSubscribed ? 'Unsubscribe' : 'Subscribe' }}
            </button>
          </div>
          
          <div v-if="video.description" class="video-player-page__description">
            <h3 class="video-player-page__description-title">Description</h3>
            <p class="video-player-page__description-text">{{ video.description }}</p>
          </div>
          
          <!-- Comments Section -->
          <div class="video-player-page__comments">
            <h3 class="video-player-page__comments-title">Comments</h3>
            
            <div v-if="userStore.isAuthenticated.value" class="video-player-page__comment-form">
              <img 
                :src="userAvatarUrl" 
                alt="Your avatar" 
                class="video-player-page__comment-avatar"
              />
              <div class="video-player-page__comment-input-container">
                <textarea 
                  v-model="newComment" 
                  class="video-player-page__comment-input"
                  placeholder="Add a comment..."
                  rows="2"
                />
                <div class="video-player-page__comment-actions">
                  <button 
                    class="video-player-page__comment-cancel"
                    @click="newComment = ''"
                  >
                    Cancel
                  </button>
                  <button 
                    class="video-player-page__comment-submit"
                    :disabled="!newComment.trim() || isSubmittingComment"
                    @click="submitComment"
                  >
                    {{ isSubmittingComment ? 'Submitting...' : 'Comment' }}
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else class="video-player-page__comments-login">
              <p>You need to be logged in to comment.</p>
              <router-link to="/auth/login" class="video-player-page__login-link">Log In</router-link>
            </div>
            
            <div v-if="comments.length === 0" class="video-player-page__no-comments">
              <p v-if="userStore.isAuthenticated.value">No comments yet. Be the first to comment!</p>
              <p v-else>No comments</p>
            </div>
            
            <div v-else class="video-player-page__comments-list">
              <div 
                v-for="comment in comments" 
                :key="comment.id" 
                class="video-player-page__comment"
              >
                <img 
                  :src="getCommenterAvatarUrl(comment)" 
                  alt="Commenter avatar" 
                  class="video-player-page__comment-avatar"
                />
                <div class="video-player-page__comment-content">
                  <div class="video-player-page__comment-header">
                    <span class="video-player-page__comment-username">{{ comment.username }}</span>
                    <span class="video-player-page__comment-date">
                      {{ new Date(comment.createdAt).toLocaleDateString() }}
                    </span>
                  </div>
                  <p class="video-player-page__comment-text">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Related Videos -->
      <div class="video-player-page__sidebar">
        <h3 class="video-player-page__sidebar-title">Related Videos</h3>
        
        <div v-if="isLoadingRelated" class="video-player-page__related-loading">
          <div class="video-player-page__loading-spinner video-player-page__loading-spinner--small"/>
          <p>Loading related videos...</p>
        </div>
        
        <div v-else-if="relatedVideos.length === 0" class="video-player-page__no-related">
          <p>No related videos found.</p>
        </div>
        
        <div v-else class="video-player-page__related-list">
          <div 
            v-for="relatedVideo in relatedVideos" 
            :key="relatedVideo.id" 
            class="video-player-page__related-item"
            @click="router.push(`/videos/player?id=${relatedVideo.id}`)"
          >
            <div class="video-player-page__related-thumbnail">
              <img 
                :src="relatedVideo.thumbnailUrl" 
                alt="Video thumbnail" 
                class="video-player-page__related-image"
              />
              <span v-if="relatedVideo.duration" class="video-player-page__related-duration">
                {{ formatDuration(relatedVideo.duration) }}
              </span>
            </div>
            <div class="video-player-page__related-info">
              <h4 class="video-player-page__related-title">{{ relatedVideo.title }}</h4>
              <p class="video-player-page__related-username">{{ relatedVideo.username }}</p>
              <p class="video-player-page__related-meta">
                {{ relatedVideo.views }} views • {{ new Date(relatedVideo.createdAt).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.video-player-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
}

.video-player-page__main {
  width: 100%;
}

.video-player-page__loading,
.video-player-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  grid-column: 1 / -1;
}

.video-player-page__loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(65, 164, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary, #41A4FF);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

.video-player-page__loading-spinner--small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.video-player-page__error-icon {
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

.video-player-page__back-button {
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

.video-player-page__back-button:hover {
  background-color: var(--secondary, #9067E6);
}

.video-player-container {
  width: 100%;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  position: relative;
}

.video-player-page__processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 24px;
  height: 100%;
}

.video-player-page__processing-icon {
  color: var(--primary, #41A4FF);
  margin-bottom: 16px;
}

.video-player-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-player-container:hover .video-player-controls {
  opacity: 1;
}

.video-player-controls__left,
.video-player-controls__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.video-player-controls__button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.video-player-controls__button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.video-player-controls__button svg.active {
  stroke: var(--primary, #41A4FF);
  fill: var(--primary, #41A4FF);
}

.video-player-controls__settings {
  position: relative;
}

.video-player-controls__settings-menu {
  position: absolute;
  bottom: 40px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  padding: 8px;
  width: 180px;
}

.video-player-controls__settings-header {
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
}

.video-player-controls__settings-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.video-player-controls__settings-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.video-player-controls__settings-option {
  background: none;
  border: none;
  color: white;
  text-align: left;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.video-player-controls__settings-option:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.video-player-controls__settings-option.active {
  background-color: var(--primary, #41A4FF);
}

.video-player-page__content {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
}

.video-player-page__header {
  margin-bottom: 16px;
}

.video-player-page__title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--text-primary, #1A2233);
}

.video-player-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--text-secondary, #67748B);
  font-size: 14px;
}

.video-player-page__visibility {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.video-player-page__visibility--public {
  background-color: var(--success, #8FF6E9);
  color: #155724;
}

.video-player-page__visibility--private {
  background-color: var(--error, #FF677B);
  color: white;
}

.video-player-page__visibility--unlisted {
  background-color: var(--text-secondary, #67748B);
  color: white;
}

.video-player-page__actions {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.video-player-page__action-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.video-player-page__action-button--edit {
  background-color: var(--primary, #41A4FF);
  color: white;
}

.video-player-page__action-button--edit:hover {
  background-color: var(--secondary, #9067E6);
}

.video-player-page__action-button--delete {
  background-color: transparent;
  color: var(--error, #FF677B);
  border: 1px solid var(--error, #FF677B);
}

.video-player-page__action-button--delete:hover {
  background-color: var(--error, #FF677B);
  color: white;
}

.video-player-page__action-button--share {
  background-color: transparent;
  color: var(--text-secondary, #67748B);
  border: 1px solid var(--text-secondary, #67748B);
  margin-left: auto;
}

.video-player-page__action-button--share:hover {
  background-color: var(--text-secondary, #67748B);
  color: white;
}

.video-player-page__uploader {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(103, 116, 139, 0.2);
}

.video-player-page__uploader-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 16px;
  cursor: pointer;
}

.video-player-page__uploader-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(65, 164, 255, 0.5);
}

.video-player-page__uploader-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.video-player-page__uploader-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #1A2233);
  cursor: pointer;
}

.video-player-page__uploader-name:hover {
  color: var(--primary, #41A4FF);
}

.video-player-page__uploader-subscribers {
  font-size: 14px;
  color: var(--text-secondary, #67748B);
  margin-top: 4px;
}

.video-player-page__subscribe-button {
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

.video-player-page__subscribe-button:hover {
  background-color: var(--secondary, #9067E6);
}

.video-player-page__subscribe-button.subscribed {
  background-color: var(--panel-bg, #E6F0FB);
  color: var(--text-primary, #1A2233);
  border: 1px solid rgba(103, 116, 139, 0.3);
}

.video-player-page__subscribe-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Success message */
.video-player-page__success-message {
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
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.video-player-page__description {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(103, 116, 139, 0.2);
}

.video-player-page__description-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px;
  color: var(--text-primary, #1A2233);
}

.video-player-page__description-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary, #1A2233);
  white-space: pre-wrap;
  margin: 0;
}

.video-player-page__comments-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 16px;
  color: var(--text-primary, #1A2233);
}

.video-player-page__comment-form {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.video-player-page__comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.video-player-page__comment-input-container {
  flex: 1;
}

.video-player-page__comment-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(103, 116, 139, 0.2);
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  margin-bottom: 8px;
}

.video-player-page__comment-input:focus {
  outline: none;
  border-color: var(--primary, #41A4FF);
}

.video-player-page__comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.video-player-page__comment-cancel,
.video-player-page__comment-submit {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.video-player-page__comment-cancel {
  background-color: transparent;
  color: var(--text-secondary, #67748B);
  border: 1px solid var(--text-secondary, #67748B);
}

.video-player-page__comment-submit {
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
}

.video-player-page__comment-submit:disabled {
  background-color: rgba(65, 164, 255, 0.5);
  cursor: not-allowed;
}

.video-player-page__comments-login {
  text-align: center;
  padding: 24px;
  background-color: rgba(103, 116, 139, 0.1);
  border-radius: 4px;
  margin-bottom: 24px;
}

.video-player-page__login-link {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 16px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
}

.video-player-page__no-comments {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary, #67748B);
}

.video-player-page__comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-player-page__comment {
  display: flex;
  gap: 16px;
}

.video-player-page__comment-content {
  flex: 1;
}

.video-player-page__comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.video-player-page__comment-username {
  font-weight: 500;
  color: var(--text-primary, #1A2233);
}

.video-player-page__comment-date {
  font-size: 12px;
  color: var(--text-secondary, #67748B);
}

.video-player-page__comment-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary, #1A2233);
  margin: 0;
}

.video-player-page__sidebar {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
}

.video-player-page__sidebar-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 16px;
  color: var(--text-primary, #1A2233);
}

.video-player-page__related-loading,
.video-player-page__no-related {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary, #67748B);
}

.video-player-page__related-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-player-page__related-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.video-player-page__related-item:hover {
  transform: translateY(-2px);
}

.video-player-page__related-thumbnail {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.video-player-page__related-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-player-page__related-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 2px;
}

.video-player-page__related-info {
  flex: 1;
  min-width: 0;
}

.video-player-page__related-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px;
  color: var(--text-primary, #1A2233);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-player-page__related-username {
  font-size: 12px;
  color: var(--text-secondary, #67748B);
  margin: 0 0 2px;
}

.video-player-page__related-meta {
  font-size: 12px;
  color: var(--text-secondary, #67748B);
  margin: 0;
}

@media (max-width: 1024px) {
  .video-player-page {
    grid-template-columns: 1fr;
  }
  
  .video-player-page__sidebar {
    margin-top: 24px;
  }
}

@media (max-width: 768px) {
  .video-player-page {
    padding: 16px;
  }
  
  .video-player-page__title {
    font-size: 20px;
  }
  
  .video-player-page__meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .video-player-page__actions {
    flex-wrap: wrap;
  }
  
  .video-player-page__action-button--share {
    margin-left: 0;
    margin-top: 8px;
    width: 100%;
  }
  
  .video-player-page__comment-form {
    flex-direction: column;
  }
  
  .video-player-page__comment-avatar {
    align-self: flex-start;
  }
}
</style>