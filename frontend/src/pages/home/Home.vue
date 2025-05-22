<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import VideoCard from '@/entities/video/ui/VideoCard';
import { videoStore, VideoVisibility, VideoStatus } from '@/entities/video';
import { categoryStore } from '@/entities/category';
import { tagStore } from '@/entities/tag';
import { isDev } from '@/shared/lib/isDev';

const router = useRouter();
const isLoading = ref(true);
const videos = ref<any[]>([]);
const error = ref<string | null>(null);
const selectedCategoryId = ref<string | null>(null);
const selectedTagId = ref<string | null>(null);

// Watch for category or tag changes and reload videos
watch([selectedCategoryId, selectedTagId], async () => {
  await fetchVideos();
});

// Fetch videos with current filters
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
    
    // Add category filter if selected
    if (selectedCategoryId.value) {
      queryParams.categoryId = selectedCategoryId.value;
    }
    
    // Add tag filter if selected
    if (selectedTagId.value) {
      queryParams.tagId = selectedTagId.value;
    }
    
    // Fetch videos with filters
    const response = await videoStore.fetchVideos(queryParams);

    if (isDev()) {
      console.log("VIDEOS: ", response.items);
    }
    
    // Store videos
    videos.value = response.items;
  } catch (err) {
    console.error('Failed to fetch videos:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch videos';
  } finally {
    isLoading.value = false;
  }
}

// Fetch categories and tags, then fetch videos
onMounted(async () => {
  try {
    // Fetch categories and tags in parallel
    await Promise.all([
      categoryStore.fetchCategories(),
      tagStore.fetchTags()
    ]);
    
    // Then fetch videos
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
  console.log(`Clicked on channel: ${channelName}`);
};
</script>

<template>
  <main>
    <div class="container">
      <h1 class="page-title">Discover Videos</h1>
      
      <div class="filters">
        <div class="filter-section">
          <h3 class="filter-title">Categories</h3>
          <div class="filter-options">
            <button
              class="filter-option"
              :class="{ 'filter-option--active': selectedCategoryId === null }"
              @click="selectedCategoryId = null"
            >
              All
            </button>
            <button
              v-for="category in categoryStore.categories.value"
              :key="category.id"
              class="filter-option"
              :class="{ 'filter-option--active': selectedCategoryId === category.id }"
              @click="selectedCategoryId = category.id"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">Tags</h3>
          <div class="filter-options">
            <button
              class="filter-option"
              :class="{ 'filter-option--active': selectedTagId === null }"
              @click="selectedTagId = null"
            >
              All
            </button>
            <button
              v-for="tag in tagStore.tags.value"
              :key="tag.id"
              class="filter-option"
              :class="{ 'filter-option--active': selectedTagId === tag.id }"
              @click="selectedTagId = tag.id"
            >
              #{{ tag.name }}
            </button>
          </div>
        </div>
      </div>
      
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

.filters {
  margin-bottom: 24px;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary, #1A2233);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-option {
  padding: 6px 12px;
  background-color: var(--panel-bg, #E6F0FB);
  border: 1px solid transparent;
  border-radius: 16px;
  font-size: 14px;
  color: var(--text-secondary, #67748B);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-option:hover {
  border-color: var(--primary, #41A4FF);
  color: var(--primary, #41A4FF);
}

.filter-option--active {
  background-color: var(--primary, #41A4FF);
  color: white;
}

.filter-option--active:hover {
  background-color: var(--secondary, #9067E6);
  color: white;
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
  
  .filter-options {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }
  
  .filter-option {
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
}
</style>
