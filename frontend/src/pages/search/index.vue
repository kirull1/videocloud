<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VideoCard from '@/entities/video/ui/VideoCard';
import { videoStore, VideoVisibility, VideoStatus } from '@/entities/video';
import { categoryStore } from '@/entities/category';
import { tagStore } from '@/entities/tag';
import { isDev } from '@/shared/lib/isDev';

const route = useRoute();
const router = useRouter();
const isLoading = ref(true);
const videos = ref<any[]>([]);
const error = ref<string | null>(null);
const searchQuery = ref<string>('');
const selectedCategoryId = ref<string | null>(null);
const selectedTagId = ref<string | null>(null);
const totalResults = ref(0);

// Get search query from route
searchQuery.value = route.query.q as string || '';

// Watch for route changes to update search query
watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery as string || '';
  fetchSearchResults();
});

// Watch for category or tag changes and reload videos
watch([selectedCategoryId, selectedTagId], async () => {
  await fetchSearchResults();
});

// Fetch search results
async function fetchSearchResults() {
  try {
    isLoading.value = true;
    
    // Prepare query parameters
    const queryParams: any = {
      visibility: VideoVisibility.PUBLIC,
      status: VideoStatus.READY,
      limit: 20,
      sortBy: 'relevance',
      sortOrder: 'DESC'
    };
    
    // Add search query if present
    if (searchQuery.value) {
      queryParams.search = searchQuery.value;
    }
    
    // Add category filter if selected
    if (selectedCategoryId.value) {
      queryParams.categoryId = selectedCategoryId.value;
    }
    
    // Add tag filter if selected
    if (selectedTagId.value) {
      queryParams.tagId = selectedTagId.value;
    }
    
    // Fetch videos with search query and filters
    const response = await videoStore.fetchVideos(queryParams);

    if (isDev()) {
      console.log("SEARCH RESULTS: ", response.items);
    }
    
    // Store videos and total
    videos.value = response.items;
    totalResults.value = response.total;
  } catch (err) {
    console.error('Failed to fetch search results:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch search results';
  } finally {
    isLoading.value = false;
  }
}

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

// Fetch categories and tags, then fetch search results
onMounted(async () => {
  try {
    // Fetch categories and tags in parallel
    await Promise.all([
      categoryStore.fetchCategories(),
      tagStore.fetchTags()
    ]);
    
    // Then fetch search results
    await fetchSearchResults();
  } catch (err) {
    console.error('Failed to fetch initial data:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch initial data';
    isLoading.value = false;
  }
});
</script>

<template>
  <main>
    <div class="container">
      <div class="search-header">
        <h1 class="page-title">
          <span v-if="searchQuery">Search results for "{{ searchQuery }}"</span>
          <span v-else>Search videos</span>
        </h1>
        <div v-if="!isLoading && searchQuery" class="search-results-count">
          {{ totalResults }} results found
        </div>
      </div>
      
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
        <div class="spinner"/>
        <p>Searching videos...</p>
      </div>
      
      <div v-else-if="videos.length === 0" class="empty-message">
        <div v-if="searchQuery">
          No videos found for "{{ searchQuery }}"
          <p class="empty-message-suggestion">Try different keywords or remove filters</p>
        </div>
        <div v-else>
          Enter a search term to find videos
        </div>
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

.search-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary, #1A2233);
}

.search-results-count {
  font-size: 14px;
  color: var(--text-secondary, #67748B);
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--text-secondary, #67748B);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(65, 164, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary, #41A4FF);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: var(--text-secondary, #67748B);
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  font-size: 16px;
}

.empty-message-suggestion {
  margin-top: 8px;
  font-size: 14px;
  opacity: 0.8;
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
  
  .page-title {
    font-size: 20px;
  }
}
</style>