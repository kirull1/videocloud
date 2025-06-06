<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '../model/userStore'
import { channelStore } from '@/entities/channel'
import { generateAvatarUrl } from '@/shared/lib/avatar'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    required: true
  },
  userName: {
    type: String,
    default: ''
  },
  userAvatar: {
    type: String,
    default: ''
  }
});

const router = useRouter()
const isMenuOpen = ref(false)
const hasChannel = ref(false)
const isCheckingChannel = ref(false)
const isLoadingUser = ref(false)
const fallbackAvatar = ref(generateAvatarUrl(props.userName || 'User'))

// Watch for changes in authentication state
watch(() => props.isAuthenticated, async (newValue) => {
  if (newValue) {
    await checkUserAndChannel();
  }
});

// Update fallback avatar when username changes
watch(() => props.userName, (newName) => {
  if (newName) {
    fallbackAvatar.value = generateAvatarUrl(newName);
  }
});

// Watch for avatar URL changes
watch(() => props.userAvatar, (newAvatarUrl) => {
  console.log('Avatar URL updated:', newAvatarUrl);
});

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    console.log('Avatar image failed to load, using fallback');
    // Use our computed fallback
    target.src = fallbackAvatar.value;
    
    // Also add an onerror handler to prevent infinite error loops
    target.onerror = null;
    
    // Force a refresh of the avatar URL in the userStore
    if (userStore.user.value) {
      userStore.fetchUserProfile();
    }
  }
};

onMounted(async () => {  
  if (props.isAuthenticated) {
    await checkUserAndChannel();
  }
});

const checkUserAndChannel = async () => {
  // Load user profile if not already loaded
  if (!userStore.user.value) {
    try {
      isLoadingUser.value = true;
      await userStore.fetchUserProfile();
      console.log('User profile loaded in Auth component:', userStore.user.value);
      
      // Update fallback avatar with username from store
      const username = userStore.username.value;
      if (username) {
        fallbackAvatar.value = generateAvatarUrl(username);
      }
    } catch (error) {
      console.error('Failed to load user profile in Auth component:', error);
    } finally {
      isLoadingUser.value = false;
    }
  }
  
  // Check if user has a channel
  try {
    isCheckingChannel.value = true
    await channelStore.fetchMyChannel()
    hasChannel.value = !!channelStore.myChannel
  } catch (error) {
    console.error('Error checking for channel:', error)
    hasChannel.value = false
  } finally {
    isCheckingChannel.value = false
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/auth/login')
  isMenuOpen.value = false
}
</script>

<template>
  <div class="auth">
    <div v-if="!isAuthenticated" class="auth-buttons">
      <router-link to="/auth/login" class="auth-button login">Sign In</router-link>
      <router-link to="/auth/register" class="auth-button register">Sign Up</router-link>
    </div>
    <div v-else class="user-menu">
      
      <button class="user-button" @click="toggleMenu">
        <img :src="userAvatar"
             alt="User avatar"
             class="avatar"
             @error="handleImageError" />
        <span class="username">{{ userName }}</span>
      </button>
      
      <transition name="menu-fade">
        <div v-if="isMenuOpen" class="menu">
          <router-link to="/profile" class="menu-item" @click="toggleMenu">Profile</router-link>
          <router-link to="/subscriptions" class="menu-item" @click="toggleMenu">Subscriptions</router-link>
          
          <!-- Show Upload Video or Create Channel in menu based on whether user has a channel -->
          <template v-if="hasChannel">
            <router-link :to="`/channel/${channelStore.myChannel?.id}`" class="menu-item" @click="toggleMenu">
              My Channel
            </router-link>
            <router-link to="/videos/upload" class="menu-item" @click="toggleMenu">Upload Video</router-link>
          </template>
          <template v-else>
            <router-link to="/channel/create" class="menu-item create-channel" @click="toggleMenu">
              Create Channel
            </router-link>
          </template>
          
          <button class="menu-item logout" @click="handleLogout">Logout</button>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.auth-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.login {
  color: #007bff;
  border: 1px solid #007bff;
}

.login:hover {
  background-color: #007bff;
  color: white;
}

.register {
  background-color: #007bff;
  color: white;
}

.register:hover {
  background-color: #0056b3;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}


.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.username {
  font-weight: 500;
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 100;
}

.menu-item {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.logout {
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: #dc3545;
}

.logout:hover {
  background-color: #dc3545;
  color: white;
}

.create-channel {
  color: #28a745;
  font-weight: 500;
}

.create-channel:hover {
  background-color: #28a745;
  color: white;
}

/* Menu animation */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .username {
    display: none;
  }
}
</style>