<script setup lang="ts">
import { VideoUploadForm } from '@/features/video-upload/ui';
</script>

<template>
  <div class="upload-page">
    <VideoUploadForm />
  </div>
</template>

<style scoped>
.upload-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .upload-page {
    padding: 1rem 0.5rem;
  }
}
</style>