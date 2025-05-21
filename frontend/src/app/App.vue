<script setup lang="ts">
import { isDev } from '@/shared/lib/isDev';
import { RouterView } from 'vue-router'

if (isDev()) {
  console.log('Running in development mode');
}
</script>

<template>
  <RouterView />
</template>
