<script setup lang="ts">
import { isDev } from '@/shared/lib/isDev';
import Header from '@/widgets/header/Header.vue';
import { RouterView } from 'vue-router'

if (isDev()) {
  console.log('Running in development mode');
}
</script>

<template>
  <Header />
  <RouterView />
</template>
