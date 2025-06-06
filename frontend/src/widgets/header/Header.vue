<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, watch } from 'vue';
import Search from '@/features/search';
import Auth from '@/features/auth';
import Logo from '@/shared/ui/Logo';
import { userStore } from '@/features/auth/model/userStore';

const router = useRouter();

// Get authentication state from userStore
const isAuthenticated = computed(() => userStore.isAuthenticated.value);
const userName = computed(() => userStore.username.value);
const userAvatar = computed(() => userStore.avatarUrl.value);

// Ensure user profile is loaded if authenticated
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await userStore.fetchUserProfile();
      console.log('User profile loaded in Header:', userStore.user.value);
    } catch (error) {
      console.error('Failed to load user profile in Header:', error);
    }
  }
});

// Watch for authentication changes to reload user profile
watch(() => isAuthenticated.value, async (newValue: boolean) => {
  if (newValue) {
    try {
      await userStore.fetchUserProfile();
      console.log('User profile reloaded after auth change:', userStore.user.value);
    } catch (error) {
      console.error('Failed to reload user profile after auth change:', error);
    }
  }
});

defineProps({
  isSearchLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['login', 'signup', 'logout']);

const handleSearch = (query: string) => {
  router.push({
    path: '/search',
    query: { q: query }
  });
};

const handleLogin = () => {
  emit('login');
};

const handleSignup = () => {
  emit('signup');
};

const handleLogout = () => {
  emit('logout');
};
</script>

<template>
  <header class="header">
    <div class="header__container">
      <div class="header__logo">
        <a href="/" class="header__logo-link">
          <Logo size="medium" />
        </a>
      </div>
      
      <div class="header__search">
        <Search 
          :is-loading="isSearchLoading" 
          placeholder="Search videos..." 
          @search="handleSearch"
        />
      </div>
      
      <div class="header__auth">
        <Auth 
          :is-authenticated="isAuthenticated"
          :user-name="userName"
          :user-avatar="userAvatar"
          @login="handleLogin"
          @signup="handleSignup"
          @logout="handleLogout"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  height: 56px;
  background-color: var(--video-bg);
  border-bottom: 1px solid var(--panel-bg);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header__container {
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__logo {
  flex: 0 0 auto;
  margin-right: 32px;
  display: flex;
  align-items: center;
}

.header__logo-link {
  display: flex;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
}

.header__logo-link:hover {
  opacity: 0.9;
}

.header__search {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  max-width: 640px;
  width: 100%;
}

.header__auth {
  flex: 0 0 auto;
  margin-left: 32px;
  display: flex;
  align-items: center;
}

@media (max-width: 1024px) {
  .header__container {
    padding: 0 16px;
  }
  
  .header__logo {
    margin-right: 24px;
  }
  
  .header__auth {
    margin-left: 24px;
  }
}

@media (max-width: 768px) {
  .header__container {
    padding: 0 12px;
  }
  
  .header__logo {
    margin-right: 16px;
  }
  
  .header__auth {
    margin-left: 16px;
  }
  
  .header__search {
    max-width: 400px;
  }
}

@media (max-width: 600px) {
  .header__search {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .header__container {
    padding: 0 8px;
  }
  
  .header__logo {
    margin-right: 8px;
  }
  
  .header__auth {
    margin-left: 8px;
  }
}
</style>