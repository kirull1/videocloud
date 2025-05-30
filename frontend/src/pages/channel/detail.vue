<template>
  <div class="channel-page">
    <div v-if="loading" class="loading">Loading channel data...</div>
    
    <div v-else-if="error" class="error">
      <h2>Error loading channel</h2>
      <p>{{ error }}</p>
      <button @click="loadData">Retry</button>
    </div>
    
    <div v-else-if="channel" class="channel-content">
      <div class="channel-banner" :style="{ backgroundColor: channel.themeColor || '#41A4FF' }">
        <div class="channel-info">
          <div v-if="channel.userId" class="channel-avatar">
            <img :src="avatarUrl" alt="Channel Avatar"/>
          </div>
          <div class="channel-details">
            <h1 class="channel-name">{{ channel.name }}</h1>
            <div v-if="user" class="channel-username">{{ user.username }}</div>
            <div class="channel-stats">
              <span>{{ formatNumber(channel.subscriberCount) }} subscribers</span>
              <span>{{ formatNumber(channel.videoCount) }} videos</span>
              <span>{{ formatNumber(channel.totalViews) }} views</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="channel-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="tab-content">
        <!-- Videos Tab -->
        <div v-if="activeTab === 'videos'" class="videos-container">
          <h2>Videos</h2>
          
          <div v-if="loadingVideos" class="loading-videos">
            Loading videos...
          </div>
          
          <div v-else-if="videos.length === 0" class="no-videos">
            <p>No videos found for this channel.</p>
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
                :channelName="user?.username || ''"
                :channelId="channel.id"
                :userId="video.userId"
                :channelAvatarUrl="avatarUrl"
                :isNew="new Date(video.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000"
                :isWatched="false"
                @click="handleVideoClick"
                @channelClick="handleChannelClick"
              />
            </div>
          </div>
        </div>
        
        <!-- About Tab -->
        <div v-if="activeTab === 'about'" class="about-container">
          <h2>About</h2>
          
          <div class="about-content">
            <div v-if="channel.description" class="channel-description">
              {{ channel.description }}
            </div>
            <div v-else class="no-description">
              This channel has no description.
            </div>
            
            <div class="channel-details">
              <div class="detail-item">
                <strong>Custom URL:</strong> 
                <span>{{ channel.customUrl || 'Not set' }}</span>
              </div>
              <div class="detail-item">
                <strong>Created:</strong> 
                <span>{{ formatDate(channel.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import VideoCard from '@/entities/video/ui/VideoCard/VideoCard.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const channel = ref(null);
const user = ref(null);
const videos = ref([]);
const loadingVideos = ref(false);
const activeTab = ref('videos');

const apiUrl = import.meta.env.VITE_API_URL || '/api';

const avatarUrl = computed(() => {
  if (channel.value?.userId) {
    return `${apiUrl}/users/${channel.value.userId}/avatar`;
  }
  return 'https://via.placeholder.com/80';
});

const tabs = [
  { id: 'videos', label: 'Videos' },
  { id: 'about', label: 'About' }
];

// Format a number with K and M suffixes
const formatNumber = (value) => {
  if (!value) return '0';
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  return value.toString();
};

// Format a date to a readable format
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Handle video click
const handleVideoClick = (videoId) => {
  router.push({
    name: 'video-watch',
    query: { id: videoId }
  });
};

// Handle channel click
const handleChannelClick = () => {
  // We're already on the channel page, so this is a no-op
};

// Load channel data
const loadChannelData = async (channelId) => {
  try {
    console.log(`Fetching channel with ID: ${channelId}`);
    
    const response = await fetch(`${apiUrl}/channels/${channelId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch channel: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Channel data:', data);
    
    return data;
  } catch (err) {
    console.error('Error fetching channel:', err);
    throw err;
  }
};

// Load user data
const loadUserData = async (userId) => {
  try {
    console.log(`Fetching user with ID: ${userId}`);
    
    const response = await fetch(`${apiUrl}/users/${userId}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch user: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log('User data:', data);
    
    return data;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
};

// Load videos for a channel
const loadChannelVideos = async (channelId) => {
  loadingVideos.value = true;
  
  try {
    console.log(`Fetching videos for channel: ${channelId}`);
    
    // Try both potential API endpoints for videos
    const response = await fetch(`${apiUrl}/videos?channelId=${channelId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.status}`);
    }
    
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Videos data:', data);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError, 'Response text:', responseText);
      throw new Error('Invalid response format from videos API');
    }
    
    // Handle different API response formats
    if (Array.isArray(data)) {
      videos.value = data;
    } else if (data && data.items && Array.isArray(data.items)) {
      videos.value = data.items;
    } else if (data && typeof data === 'object') {
      // Try to extract an array from any property that looks like a video array
      const possibleArrays = Object.values(data).filter(value => Array.isArray(value));
      if (possibleArrays.length > 0) {
        // Use the longest array found
        videos.value = possibleArrays.reduce((longest, current) => 
          current.length > longest.length ? current : longest, []);
      } else {
        console.warn('No video arrays found in response:', data);
        videos.value = [];
      }
    } else {
      console.warn('Unexpected video data format:', data);
      videos.value = [];
    }
  } catch (err) {
    console.error('Error fetching videos:', err);
    videos.value = [];
  } finally {
    loadingVideos.value = false;
  }
};

// Main load function
const loadData = async () => {
  const channelId = route.params.id;
  
  if (!channelId) {
    error.value = 'No channel ID provided';
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    // Load channel data
    channel.value = await loadChannelData(channelId);
    
    // Load user data if userId is available
    if (channel.value?.userId) {
      user.value = await loadUserData(channel.value.userId);
    }
    
    // Load videos for this channel
    await loadChannelVideos(channelId);
  } catch (err) {
    error.value = err.message;
    channel.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.channel-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.error {
  color: #e53935;
}

.error button {
  background-color: #41A4FF;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-top: 16px;
  cursor: pointer;
}

.channel-banner {
  padding: 30px;
  border-radius: 8px;
  color: white;
  margin-bottom: 20px;
}

.channel-info {
  display: flex;
  align-items: center;
}

.channel-avatar {
  margin-right: 24px;
}

.channel-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid white;
  object-fit: cover;
}

.channel-details {
  flex: 1;
}

.channel-name {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.channel-username {
  font-size: 16px;
  margin: 4px 0 12px;
  opacity: 0.9;
}

.channel-stats {
  display: flex;
  gap: 16px;
}

.channel-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 24px;
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
}

.tab-button.active {
  color: #41A4FF;
  border-bottom-color: #41A4FF;
}

.tab-content {
  min-height: 400px;
}

.videos-container h2,
.about-container h2 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 22px;
}

.loading-videos,
.no-videos {
  padding: 40px;
  text-align: center;
  color: #666;
  background: #f8f8f8;
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

.about-container .channel-description {
  background: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.no-description {
  background: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  color: #666;
  font-style: italic;
}

.channel-details .detail-item {
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .channel-info {
    flex-direction: column;
    text-align: center;
  }
  
  .channel-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .channel-stats {
    justify-content: center;
  }
  
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