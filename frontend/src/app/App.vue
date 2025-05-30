<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Header from '@/widgets/header/Header.vue';
import { authApi } from '@/features/auth/api/authApi';

// Check authentication validity when the app is mounted
onMounted(async () => {  
  if (authApi.isAuthenticated()) {
    try {
      // Check if the authentication is valid
      const isValid = await authApi.checkAuthValidity();
      
      if (!isValid) {
        console.log('Authentication is invalid, user has been logged out');
      }
    } catch (err) {
      console.error('Error checking authentication validity:', err);
    }
  }
});
</script>

<template>
  <div>
    <Header />
    <RouterView />
  </div>
</template>

<style>
</style>
