<template>
  <div class="channel-page">    
    <div v-if="isLoading && !channel" class="channel-page__loading">
      <div class="channel-page__loading-spinner"/>
      <p>Loading channel...</p>
    </div>
    
    <div v-else-if="error" class="channel-page__error">
      <div class="channel-page__error-icon">!</div>
      <p>{{ error }}</p>
      <button class="channel-page__back-button" @click="router.push('/')">
        Back to Home
      </button>
    </div>
    
    <template v-else-if="channel">
      <div 
        class="channel-page__banner" 
        :style="{ 
          backgroundImage: channel.bannerUrl ? `url(${channel.bannerUrl})` : null,
          backgroundColor: channel.themeColor || '#41A4FF'
        }"
      >
        <div class="channel-page__banner-overlay">
          <h1 class="channel-page__name">{{ channel.name }}</h1>
          <div class="channel-page__stats">
            <span class="channel-page__stat">{{ subscriberCount }} subscribers</span>
            <span class="channel-page__stat">{{ videoCount }} videos</span>
            <span class="channel-page__stat">{{ totalViews }} views</span>
          </div>
        </div>
      </div>
      
      <div class="channel-page__content">
        <div class="channel-page__tabs">
          <button 
            class="channel-page__tab" 
            :class="{ 'channel-page__tab--active': activeTab === 'videos' }"
            @click="activeTab = 'videos'"
          >
            Videos
          </button>
          <button 
            class="channel-page__tab" 
            :class="{ 'channel-page__tab--active': activeTab === 'about' }"
            @click="activeTab = 'about'"
          >
            About
          </button>
          <button 
            v-if="isOwner"
            class="channel-page__tab" 
            :class="{ 'channel-page__tab--active': activeTab === 'analytics' }"
            @click="activeTab = 'analytics'"
          >
            Analytics
          </button>
          <button 
            v-if="isOwner"
            class="channel-page__tab" 
            :class="{ 'channel-page__tab--active': activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            Settings
          </button>
        </div>
        
        <div v-if="activeTab === 'videos'" class="channel-page__videos">
          <h2 class="channel-page__section-title">Videos</h2>
          <div v-if="channelVideos.length === 0" class="channel-page__empty">
            <p>No videos yet</p>
          </div>
          <div v-else class="channel-page__video-grid">
            <!-- Replace with actual video grid component when available -->
            <p>Video grid would go here</p>
          </div>
        </div>
        
        <div v-if="activeTab === 'about'" class="channel-page__about">
          <h2 class="channel-page__section-title">About</h2>
          <p v-if="channel.description" class="channel-page__description">
            {{ channel.description }}
          </p>
          <p v-else class="channel-page__empty">
            No description available
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { channelStore } from '@/entities/channel';
import { videoStore } from '@/entities/video';
import Header from '@/widgets/header';
import type { UpdateChannelRequest } from '@/entities/channel';

// Declare localStorage for TypeScript
declare const localStorage: Storage;

const route = useRoute();
const router = useRouter();
const channelId = computed(() => route.params.id as string);
const isLoading = computed(() => channelStore.isLoading);
const error = computed(() => channelStore.error);
const channel = computed(() => channelStore.currentChannel);
const isLoadingAnalytics = ref(false);
const channelAnalytics = computed(() => channelStore.channelAnalytics);
const activeTab = ref('videos');
const channelVideos = ref<any[]>([]);
const isUpdating = ref(false);
const bannerInput = ref<HTMLInputElement | null>(null);
const bannerFile = ref<File | null>(null);
const bannerPreview = ref<string | null>(null);

// Check if the current user is the owner of the channel
const isOwner = computed(() => {
  const userId = localStorage.getItem('userId');
  return channel.value?.userId === userId;
});

// Format channel stats
const subscriberCount = computed(() => {
  if (!channel.value) return '0';
  
  const count = channel.value.subscriberCount;
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
});

const videoCount = computed(() => {
  if (!channel.value) return '0';
  return channel.value.videoCount.toString();
});

const totalViews = computed(() => {
  if (!channel.value) return '0';
  
  const count = channel.value.totalViews;
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
});

// Get max values for charts
const maxViews = computed(() => {
  if (!channelAnalytics.value?.viewsPerDay) return 1000;
  return Math.max(...channelAnalytics.value.viewsPerDay.map(item => item.views), 1000);
});

const maxSubscribers = computed(() => {
  if (!channelAnalytics.value?.subscribersPerDay) return 20;
  return Math.max(...channelAnalytics.value.subscribersPerDay.map(item => item.subscribers), 20);
});

// Channel settings form
const channelSettings = ref<UpdateChannelRequest>({
  name: '',
  description: '',
  customUrl: '',
  themeColor: '#41A4FF',
});

// Initialize channel settings form
watch(channel, (newChannel) => {
  if (newChannel) {
    channelSettings.value = {
      name: newChannel.name,
      description: newChannel.description || '',
      customUrl: newChannel.customUrl || '',
      themeColor: newChannel.themeColor || '#41A4FF',
    };
  }
}, { immediate: true });

// Fetch channel data
onMounted(async () => {
  try {
    await channelStore.fetchChannel(channelId.value);
    
    // Fetch channel videos
    if (channel.value) {
      await videoStore.fetchVideos({ channelId: channel.value.id });
      channelVideos.value = videoStore.videos.value || [];
    }
    
    // Fetch analytics if owner
    if (isOwner.value && channel.value) {
      isLoadingAnalytics.value = true;
      await channelStore.fetchChannelAnalytics(channel.value.id);
      isLoadingAnalytics.value = false;
    }
  } catch (err) {
    console.error(err);
  }
});

// Watch for tab changes
watch(activeTab, async (newTab) => {
  if (newTab === 'analytics' && isOwner.value && channel.value && !channelAnalytics.value) {
    isLoadingAnalytics.value = true;
    await channelStore.fetchChannelAnalytics(channel.value.id);
    isLoadingAnalytics.value = false;
  }
});
</script>

<style scoped>
.channel-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.channel-page__loading,
.channel-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.channel-page__loading-spinner {
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

.channel-page__error-icon {
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

.channel-page__back-button {
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

.channel-page__back-button:hover {
  background-color: var(--secondary, #9067E6);
}

.channel-page__banner {
  width: 100%;
  height: 200px;
  background-color: var(--primary, #41A4FF);
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-bottom: 24px;
  position: relative;
}

.channel-page__banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  border-radius: 0 0 8px 8px;
  color: white;
}

.channel-page__name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.channel-page__stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
}

.channel-page__content {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
}

.channel-page__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(103, 116, 139, 0.2);
  padding-bottom: 16px;
}

.channel-page__tab {
  padding: 8px 16px;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary, #67748B);
  transition: all 0.2s;
}

.channel-page__tab:hover {
  background-color: rgba(65, 164, 255, 0.1);
  color: var(--primary, #41A4FF);
}

.channel-page__tab--active {
  background-color: var(--primary, #41A4FF);
  color: white;
}

.channel-page__section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--text-primary, #1A2233);
}

.channel-page__empty {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary, #67748B);
  background-color: rgba(103, 116, 139, 0.1);
  border-radius: 8px;
}

.channel-page__description {
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-primary, #1A2233);
  white-space: pre-wrap;
}
</style>