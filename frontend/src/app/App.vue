<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Header from '@/widgets/header/Header.vue';
import { authApi } from '@/features/auth/api/authApi';
import { userStore } from '@/features/auth/model/userStore';

// Check authentication validity when the app is mounted
onMounted(async () => {  
  console.log('App mounted, initializing user store');
  
  try {
    if (authApi.isAuthenticated()) {
      // First check if the authentication is valid
      const isValid = await authApi.checkAuthValidity();
      
      if (!isValid) {
        console.log('Authentication is invalid, user has been logged out');
      } else {
        // If authentication is valid, initialize the user store
        console.log('Authentication is valid, fetching user profile');
        await userStore.fetchUserProfile();
        console.log('User profile fetched:', userStore.user.value);
      }
    }
  } catch (err) {
    console.error('Error checking authentication validity:', err);
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
