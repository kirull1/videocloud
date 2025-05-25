<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VideoProcessingProgress } from '@/features/video-upload/ui';

const route = useRoute();
const router = useRouter();
const videoId = ref<string | null>(null);

onMounted(() => {
  // Get video ID from route query
  videoId.value = route.query.id as string;
  
  // If no video ID is provided, redirect to upload page
  if (!videoId.value) {
    router.push('/videos/upload');
  }
});
</script>

<template>
  <main>
    <div class="container">
      <h1 class="page-title">Video Processing</h1>
      
      <div v-if="videoId" class="processing-container">
        <VideoProcessingProgress :videoId="videoId" />
      </div>
      
      <div v-else class="loading">
        <div class="spinner"/>
        <p>Loading...</p>
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
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary, #1A2233);
  text-align: center;
}

.processing-container {
  margin-top: 32px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }
}
</style>