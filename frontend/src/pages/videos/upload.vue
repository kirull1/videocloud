<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { VideoUploadForm } from '@/features/video-upload/ui';
import { channelStore } from '@/entities/channel';

const router = useRouter();
const isLoading = ref(true);
const hasChannel = ref(false);

onMounted(async () => {
  try {
    // Check if user has a channel
    await channelStore.fetchMyChannel();
    hasChannel.value = !!channelStore.myChannel;
    
    // If user doesn't have a channel, redirect to channel creation page
    if (!hasChannel.value) {
      console.log('No channel found, redirecting to channel creation page');
      router.push('/channel/create');
    }
  } catch (error) {
    console.error('Error checking for channel:', error);
    // If there's an error, assume no channel and redirect
    router.push('/channel/create');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="upload-page">
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"/>
      <p>Checking channel status...</p>
    </div>
    <VideoUploadForm v-else-if="hasChannel" />
    <!-- This should never show as we redirect, but just in case -->
    <div v-else class="no-channel">
      <h2>You need to create a channel first</h2>
      <p>You'll be redirected to the channel creation page...</p>
      <router-link to="/channel/create" class="create-channel-btn">
        Create Channel
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.upload-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .no-channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 2rem;
}

.loading-spinner {
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

.no-channel h2 {
  margin-bottom: 1rem;
  color: var(--text-primary, #1A2233);
}

.no-channel p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary, #67748B);
}

.create-channel-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-channel-btn:hover {
  background-color: #218838;
}

@media (max-width: 768px) {
  .upload-page {
    padding: 1rem 0.5rem;
  }
  
  .loading, .no-channel {
    padding: 1.5rem;
    min-height: 250px;
  }
}
</style>