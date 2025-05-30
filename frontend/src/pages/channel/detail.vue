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
            <button 
              v-if="isAuthenticated && !isChannelOwner" 
              class="channel-subscribe-button"
              :class="{ 'subscribed': isSubscribed }"
              :disabled="isSubscribing"
              @click="handleSubscribe"
            >
              {{ isSubscribed ? 'Unsubscribe' : 'Subscribe' }}
            </button>
            <div v-else-if="isChannelOwner" class="owner-indicator">
              This is your channel
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="subscriptionError" class="error-message">
        {{ subscriptionError }}
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
import { getAvatarUrl } from '@/shared/lib/avatar';
import { userStore } from '@/features/auth/model/userStore';
import { subscriptionApi } from '@/features/subscriptions';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const channel = ref(null);
const user = ref(null);
const videos = ref([]);
const loadingVideos = ref(false);
const activeTab = ref('videos');

// Subscription state
const isSubscribed = ref(false);
const isSubscribing = ref(false);
const subscriptionError = ref(null);

const apiUrl = import.meta.env.VITE_API_URL || '/api';

const avatarUrl = computed(() => {
  if (!user.value || !channel.value) return '';
  return getAvatarUrl(undefined, user.value.username, 100);
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

// Check if the user is authenticated
const isAuthenticated = computed(() => userStore.isAuthenticated.value);

// Check if the current user is the channel owner
const isChannelOwner = computed(() => {
  if (!channel.value || !isAuthenticated.value) return false;
  
  const currentUserId = localStorage.getItem('userId');
  if (!currentUserId) return false;
  
  return channel.value.userId === currentUserId;
});

// Fetch subscription status
const fetchSubscriptionStatus = async () => {
  if (!isAuthenticated.value || !channel.value) return;
  
  // Don't check subscription status for own channel
  if (isChannelOwner.value) {
    isSubscribed.value = false;
    return;
  }
  
  try {
    const { isSubscribed: status } = await subscriptionApi.checkSubscriptionStatus(channel.value.id);
    isSubscribed.value = status;
  } catch (err) {
    console.error('Failed to check subscription status:', err);
    // Don't show this error to the user as it's not critical
  }
};

// Fetch subscriber count
const fetchSubscriberCount = async () => {
  if (!channel.value) return;
  
  try {
    const count = await subscriptionApi.getSubscriberCount(channel.value.id);
    if (count !== null && count !== undefined) {
      // Update the channel object with the real subscriber count
      channel.value.subscriberCount = count;
    }
  } catch (err) {
    console.error('Failed to fetch subscriber count:', err);
  }
};

// Handle subscription toggle
const handleSubscribe = async () => {
  if (!isAuthenticated.value) {
    router.push('/auth/login');
    return;
  }
  
  if (!channel.value) {
    console.error('No channel data available');
    return;
  }
  
  // Clear any previous errors
  subscriptionError.value = null;
  
  try {
    isSubscribing.value = true;
    
    if (isSubscribed.value) {
      await subscriptionApi.unsubscribeFromChannel(channel.value.id);
      isSubscribed.value = false;
      
      // Update local subscriber count
      if (channel.value.subscriberCount > 0) {
        channel.value.subscriberCount--;
      }
      
      // Show unsubscribed message
      const successMessage = document.createElement('div');
      successMessage.className = 'channel-page__success-message';
      successMessage.textContent = 'Unsubscribed from channel';
      document.body.appendChild(successMessage);
      
      // Remove the success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } else {
      await subscriptionApi.subscribeToChannel(channel.value.id);
      isSubscribed.value = true;
      
      // Update local subscriber count
      channel.value.subscriberCount++;
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'channel-page__success-message';
      successMessage.textContent = 'Subscribed to channel';
      document.body.appendChild(successMessage);
      
      // Remove the success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    }
  } catch (err) {
    console.error('Failed to subscribe/unsubscribe:', err);
    subscriptionError.value = err.message || 'Failed to process subscription request';
    
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'channel-page__error-message';
    errorMessage.textContent = subscriptionError.value;
    document.body.appendChild(errorMessage);
    
    // Remove the error message after 5 seconds
    setTimeout(() => {
      document.body.removeChild(errorMessage);
    }, 5000);
  } finally {
    isSubscribing.value = false;
  }
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
    const response = await fetch(`${apiUrl}/videos?channelId=${channelId}&sortBy=createdAt&sortOrder=DESC`);
    
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
    
    // Если API не поддерживает сортировку, сортируем на клиенте
    if (videos.value.length > 0) {
      videos.value.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Сортировка от новых к старым
      });
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
  loading.value = true;
  error.value = null;
  
  try {
    const channelId = route.params.id;
    
    if (!channelId) {
      throw new Error('No channel ID provided');
    }
    
    // Load channel data
    channel.value = await loadChannelData(channelId);
    
    // Load user data if we have a userId
    if (channel.value && channel.value.userId) {
      user.value = await loadUserData(channel.value.userId);
    }
    
    // Load videos for the channel
    await loadChannelVideos(channelId);
    
    // Check subscription status
    await fetchSubscriptionStatus();
    await fetchSubscriberCount();
    
  } catch (err) {
    error.value = err.message || 'Failed to load channel data';
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
  padding: 24px;
  color: white;
}

.channel-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 24px;
  border: 4px solid rgba(255, 255, 255, 0.8);
}

.channel-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.channel-details {
  flex-grow: 1;
}

.channel-name {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.channel-username {
  font-size: 16px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.channel-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.channel-subscribe-button {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  background-color: var(--primary, #41A4FF);
  color: white;
}

.channel-subscribe-button:hover {
  background-color: var(--secondary, #9067E6);
}

.channel-subscribe-button.subscribed {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.channel-subscribe-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Success message */
.channel-page__success-message {
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

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  margin: 10px 0;
  border-radius: 5px;
  text-align: center;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.owner-indicator {
  display: inline-block;
  padding: 8px 16px;
  background-color: #e0e0e0;
  color: #555;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 8px;
}

.channel-page__error-message,
.channel-page__success-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
  animation: fadeInOut 5s ease-in-out;
  max-width: 80%;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.channel-page__success-message {
  background-color: #d4edda;
  color: #155724;
}

.channel-page__error-message {
  background-color: #f8d7da;
  color: #721c24;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}
</style> 