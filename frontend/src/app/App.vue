<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Header from '@/widgets/header/Header.vue';
import { authApi } from '@/features/auth/api/authApi';
import { userStore } from '@/features/auth/model/userStore';
import { setLocale } from '@/shared/config/i18n.config';

const { locale } = useI18n();

// Set initial language from localStorage or browser preference
const initializeLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    setLocale(savedLanguage);
  } else {
    // Try to get browser language
    const browserLang = navigator.language.split('-')[0];
    if (['en', 'ru'].includes(browserLang)) {
      setLocale(browserLang);
    } else {
      // Default to English
      setLocale('en');
    }
  }
};

// Check authentication validity when the app is mounted
onMounted(async () => {  
  console.log('App mounted, initializing user store');
  
  // Initialize language
  initializeLanguage();
  
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
