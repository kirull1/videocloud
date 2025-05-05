<script setup lang="ts">
import { ref } from 'vue';
import Search from '@/features/search';
import Auth from '@/features/auth';
import Text from '@/shared/ui/Text';

defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  userName: {
    type: String,
    default: ''
  },
  isSearchLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['search', 'login', 'signup', 'logout']);

const handleSearch = (query: string) => {
  emit('search', query);
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
          <Text content="VideoCloud" />
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
  height: 64px;
  background-color: var(--video-bg);
  border-bottom: 1px solid var(--panel-bg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header__container {
  width: 100%;
  height: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__logo {
  flex: 0 0 auto;
  margin-right: 24px;
}

.header__logo-link {
  display: block;
  text-decoration: none;
}

.header__logo-image {
  height: 32px;
  width: auto;
}

.header__search {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  max-width: 800px;
  width: 100%;
}

.header__auth {
  flex: 0 0 auto;
  margin-left: 24px;
}

@media (max-width: 768px) {
  .header {
    height: 56px;
  }
  
  .header__logo-image {
    height: 28px;
  }
  
  .header__container {
    padding: 0 12px;
  }
  
  .header__logo {
    margin-right: 12px;
  }
  
  .header__auth {
    margin-left: 12px;
  }
}

@media (max-width: 480px) {
  .header__logo {
    margin-right: 8px;
  }
  
  .header__auth {
    margin-left: 8px;
  }
}
</style>