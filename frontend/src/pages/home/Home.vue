<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import VideoCard from '@/entities/video/ui/VideoCard';
import { videoStore, VideoVisibility, VideoStatus } from '@/entities/video';
import { isDev } from '@/shared/lib/isDev';

const router = useRouter();
const isLoading = ref(true);
const videos = ref<any[]>([]);
const error = ref<string | null>(null);

// Fetch videos
async function fetchVideos() {
  try {
    isLoading.value = true;
    
    // Prepare query parameters
    const queryParams: any = {
      visibility: VideoVisibility.PUBLIC,
      status: VideoStatus.READY,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    };
    
    // Fetch videos
    const response = await videoStore.fetchVideos(queryParams);

    if (isDev()) {
      console.log("VIDEOS: ", response.items);
    }
    
    // Store videos
    videos.value = response.items;
    
    // Дополнительная сортировка на клиенте (от новых к старым)
    if (videos.value.length > 0) {
      videos.value.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Сортировка от новых к старым
      });
    }
  } catch (err) {
    console.error('Failed to fetch videos:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch videos';
  } finally {
    isLoading.value = false;
  }
}

// Fetch videos on mount
onMounted(async () => {
  try {
    await fetchVideos();
  } catch (err) {
    console.error('Failed to fetch initial data:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch initial data';
    isLoading.value = false;
  }
});

// Handle video click
const handleVideoClick = (videoId: string) => {
  router.push({
    name: 'video-watch',
    query: { id: videoId }
  });
};

// Handle channel click
const handleChannelClick = (channelName: string) => {
  // The VideoCard component now handles navigation directly
};
</script>

<template>
  <main>
    <div class="container">
      <h1 class="page-title">Discover Videos</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="isLoading" class="loading-spinner">
        Loading videos...
      </div>
      
      <div v-else-if="videos.length === 0" class="empty-message">
        No videos found
      </div>
      
      <div v-else class="video-grid">
        <div v-for="video in videos" :key="video.id" class="video-grid-item">
          <VideoCard
            :id="video.id"
            :title="video.title"
            :thumbnailUrl="video.thumbnailUrl || `https://picsum.photos/seed/${video.id}/640/360`"
            :duration="video.duration"
            :views="video.views"
            :uploadDate="new Date(video.createdAt)"
            :channelName="video.username"
            :channelId="video.channelId"
            :userId="video.userId"
            :channelAvatarUrl="`/api/users/${video.userId}/avatar`"
            :isNew="new Date(video.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000"
            :isWatched="false"
            :category="video.category"
            :tags="video.tags"
            @click="handleVideoClick"
            @channelClick="handleChannelClick"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary, #1A2233);
}

.error-message {
  padding: 16px;
  margin-bottom: 24px;
  background-color: var(--error-bg, #FFEBEE);
  color: var(--error, #FF677B);
  border-radius: 8px;
  text-align: center;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--text-secondary, #67748B);
}

.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--text-secondary, #67748B);
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.video-grid-item {
  width: 100%;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
