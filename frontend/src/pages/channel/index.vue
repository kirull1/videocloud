<template>
  <div class="channel-list-page">    
    <div class="channel-list-page__content">
      <h1 class="channel-list-page__title">Channels</h1>
      
      <div v-if="isLoading" class="channel-list-page__loading">
        <div class="channel-list-page__loading-spinner"/>
        <p>Loading channels...</p>
      </div>
      
      <div v-else-if="error" class="channel-list-page__error">
        <div class="channel-list-page__error-icon">!</div>
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="channels.length === 0" class="channel-list-page__empty">
        <p>No channels found</p>
        <button 
          v-if="isAuthenticated"
          class="channel-list-page__create-button"
          @click="createChannel"
        >
          Create Your Channel
        </button>
      </div>
      
      <div v-else class="channel-list-page__channels">
        <div 
          v-for="channel in channels" 
          :key="channel.id"
          class="channel-list-page__channel-card"
          @click="navigateToChannel(channel.id)"
        >
          <div 
            class="channel-list-page__channel-banner"
            :style="{ 
              backgroundImage: channel.bannerUrl ? `url(${channel.bannerUrl})` : 'none',
              backgroundColor: channel.themeColor || '#41A4FF'
            }"
          />
          <div class="channel-list-page__channel-info">
            <h2 class="channel-list-page__channel-name">{{ channel.name }}</h2>
            <p class="channel-list-page__channel-stats">
              {{ formatSubscriberCount(channel.subscriberCount) }} subscribers • 
              {{ formatVideoCount(channel.videoCount) }} videos
            </p>
            <p v-if="channel.description" class="channel-list-page__channel-description">
              {{ truncateDescription(channel.description) }}
            </p>
          </div>
        </div>
      </div>
      
      <div v-if="isAuthenticated && !hasChannel" class="channel-list-page__create">
        <button 
          class="channel-list-page__create-button"
          @click="createChannel"
        >
          Create Your Channel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { channelStore } from '@/entities/channel';

// Declare localStorage for TypeScript
declare const localStorage: Storage;

const router = useRouter();
const isLoading = computed(() => channelStore.isLoading);
const error = computed(() => channelStore.error);
const channels = computed(() => channelStore.channels);
const myChannel = computed(() => channelStore.myChannel);

// Check if user is authenticated
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token');
});

// Check if authenticated user has a channel
const hasChannel = computed(() => {
  return !!myChannel.value;
});

// Format subscriber count
const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Format video count
const formatVideoCount = (count: number): string => {
  return count.toString();
};

// Truncate description
const truncateDescription = (description: string): string => {
  if (description.length > 100) {
    return description.substring(0, 100) + '...';
  }
  return description;
};

// Navigate to channel page
const navigateToChannel = (channelId: string) => {
  router.push(`/channel/${channelId}`);
};

// Create a new channel
const createChannel = () => {
  router.push('/channel/create');
};

// Fetch channels on mount
onMounted(async () => {
  try {
    await channelStore.fetchChannels();
    
    // If user is authenticated, try to fetch their channel
    if (isAuthenticated.value) {
      try {
        await channelStore.fetchMyChannel();
      } catch (err) {
        // User doesn't have a channel yet, that's okay
        console.log('User does not have a channel yet');
      }
    }
  } catch (err) {
    console.error(err);
  }
});
</script>

<style scoped>
.channel-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.channel-list-page__content {
  margin-top: 24px;
}

.channel-list-page__title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 24px;
  color: var(--text-primary, #1A2233);
}

.channel-list-page__loading,
.channel-list-page__error,
.channel-list-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
}

.channel-list-page__loading-spinner {
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

.channel-list-page__error-icon {
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

.channel-list-page__create-button {
  margin-top: 16px;
  padding: 10px 20px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.channel-list-page__create-button:hover {
  background-color: var(--secondary, #9067E6);
}

.channel-list-page__channels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.channel-list-page__channel-card {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.channel-list-page__channel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.channel-list-page__channel-banner {
  height: 100px;
  background-color: var(--primary, #41A4FF);
  background-size: cover;
  background-position: center;
}

.channel-list-page__channel-info {
  padding: 16px;
}

.channel-list-page__channel-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-primary, #1A2233);
}

.channel-list-page__channel-stats {
  font-size: 14px;
  color: var(--text-secondary, #67748B);
  margin: 0 0 8px;
}

.channel-list-page__channel-description {
  font-size: 14px;
  color: var(--text-primary, #1A2233);
  margin: 0;
  line-height: 1.4;
}

.channel-list-page__create {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>