<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { videoStore, VideoStatus, VideoVisibility } from '@/entities/video';
import { VideoPlayer } from '@/entities/video/ui';

const route = useRoute();
const router = useRouter();
const videoId = computed(() => route.query.id as string);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Mock data for test videos
const mockVideos = {
  video1: {
    id: 'video1',
    title: 'Introduction to NestJS',
    description: 'Learn the basics of NestJS, a progressive Node.js framework for building efficient and scalable server-side applications.',
    thumbnailUrl: 'https://picsum.photos/seed/video1/640/360',
    duration: 210, // 3:30
    views: 3200,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    userId: 'user1',
    username: 'testuser',
    userAvatarUrl: 'https://picsum.photos/seed/user1/100/100',
    channelId: 'channel1',
    channelName: 'Test Channel',
    status: VideoStatus.READY,
    visibility: VideoVisibility.PUBLIC
  },
  video2: {
    id: 'video2',
    title: 'React Hooks Deep Dive',
    description: 'An in-depth look at React Hooks and how they can simplify your React components.',
    thumbnailUrl: 'https://picsum.photos/seed/video2/640/360',
    duration: 255, // 4:15
    views: 4100,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    userId: 'user1',
    username: 'testuser',
    userAvatarUrl: 'https://picsum.photos/seed/user1/100/100',
    channelId: 'channel1',
    channelName: 'Test Channel',
    status: VideoStatus.READY,
    visibility: VideoVisibility.PUBLIC
  },
  video3: {
    id: 'video3',
    title: 'Piano Basics for Beginners',
    description: 'Start your piano journey with these basic lessons for complete beginners.',
    thumbnailUrl: 'https://picsum.photos/seed/video3/640/360',
    duration: 345, // 5:45
    views: 2800,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    userId: 'user2',
    username: 'kirull1',
    userAvatarUrl: 'https://picsum.photos/seed/user2/100/100',
    channelId: 'channel2',
    channelName: 'Music Channel',
    status: VideoStatus.READY,
    visibility: VideoVisibility.PUBLIC
  },
  video4: {
    id: 'video4',
    title: 'Minecraft Building Tips',
    description: 'Improve your Minecraft building skills with these useful tips and tricks.',
    thumbnailUrl: 'https://picsum.photos/seed/video4/640/360',
    duration: 180, // 3:00
    views: 5600,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    userId: 'user1',
    username: 'testuser',
    userAvatarUrl: 'https://picsum.photos/seed/user1/100/100',
    channelId: 'channel1',
    channelName: 'Test Channel',
    status: VideoStatus.READY,
    visibility: VideoVisibility.PUBLIC
  }
};

// Get the current video from the store or mock data
const video = computed(() => {
  const id = videoId.value;
  if (id && id in mockVideos) {
    return mockVideos[id as keyof typeof mockVideos];
  }
  return videoStore.currentVideo.value;
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

// Get mock video URL for test videos
const getMockVideoUrl = (id: string) => {
  // For test videos, use a sample video URL
  if (id in mockVideos) {
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  }
  // For real videos, use the API
  return `/api/videos/${id}/stream`;
};

// Fetch the video when the component is mounted or videoId changes
watch(videoId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    // If it's a mock video, no need to fetch from the API
    if (newId in mockVideos) {
      isLoading.value = true;
      // Simulate loading delay
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
      return;
    }
    
    // Otherwise, fetch from the API
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

// Navigate to the channel page with page refresh
const navigateToChannel = () => {
  if (video.value?.channelId) {
    console.log('Navigating to channel:', video.value.channelId);
    // Simplify the URL construction to ensure it works correctly
    window.location.href = `/channel/${video.value.channelId}`;
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
          v-else
          :src="getMockVideoUrl(video.id)"
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