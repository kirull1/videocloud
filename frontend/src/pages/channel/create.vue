<template>
  <div class="create-channel-page">
    <div class="create-channel-page__content">
      <h1 class="create-channel-page__title">Create Your Channel</h1>
      
      <div v-if="isLoading" class="create-channel-page__loading">
        <div class="create-channel-page__loading-spinner"/>
        <p>Checking channel status...</p>
      </div>
      
      <div v-else-if="!isAuthenticated" class="create-channel-page__auth-required">
        <p>You need to be logged in to create a channel.</p>
        <button 
          class="create-channel-page__login-button"
          @click="router.push('/auth/login')"
        >
          Log In
        </button>
      </div>
      
      <form 
        v-else
        class="create-channel-page__form" 
        @submit.prevent="createChannel"
      >
        <div class="create-channel-page__form-group">
          <label for="channelName" class="create-channel-page__form-label">Channel Name *</label>
          <input 
            id="channelName"
            v-model="channelData.name"
            type="text"
            class="create-channel-page__form-input"
            required
            maxlength="100"
          />
          <p class="create-channel-page__form-help">
            This is the name that will be displayed on your channel page.
          </p>
        </div>
        
        <div class="create-channel-page__form-group">
          <label for="channelDescription" class="create-channel-page__form-label">Description</label>
          <textarea 
            id="channelDescription"
            v-model="channelData.description"
            class="create-channel-page__form-textarea"
            maxlength="255"
          />
          <p class="create-channel-page__form-help">
            Tell viewers about your channel. This will appear on your channel page.
          </p>
        </div>
        
        <div class="create-channel-page__form-group">
          <label for="channelCustomUrl" class="create-channel-page__form-label">Custom URL</label>
          <div class="create-channel-page__custom-url-input">
            <span class="create-channel-page__custom-url-prefix">/channel/</span>
            <input 
              id="channelCustomUrl"
              v-model="channelData.customUrl"
              type="text"
              class="create-channel-page__form-input create-channel-page__custom-url"
              pattern="[a-zA-Z0-9_-]+"
              title="Custom URL can only contain letters, numbers, underscores, and hyphens"
            />
          </div>
          <p class="create-channel-page__form-help">
            Create a custom URL for your channel. Only letters, numbers, underscores, and hyphens are allowed.
          </p>
        </div>
        
        <div class="create-channel-page__form-group">
          <label for="channelThemeColor" class="create-channel-page__form-label">Theme Color</label>
          <input 
            id="channelThemeColor"
            v-model="channelData.themeColor"
            type="color"
            class="create-channel-page__form-color"
          />
          <p class="create-channel-page__form-help">
            Choose a theme color for your channel.
          </p>
        </div>
        
        <div class="create-channel-page__form-actions">
          <button 
            type="submit"
            class="create-channel-page__form-submit"
            :disabled="isCreating"
          >
            {{ isCreating ? 'Creating...' : 'Create Channel' }}
          </button>
          <button 
            type="button"
            class="create-channel-page__form-cancel"
            @click="router.push('/channel')"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { channelStore } from '@/entities/channel';
import type { CreateChannelRequest } from '@/entities/channel';

// Declare localStorage for TypeScript
declare const localStorage: Storage;

const router = useRouter();
const isLoading = ref(true);
const isCreating = computed(() => channelStore.isLoading);
const error = computed(() => channelStore.error);
const checkingChannel = ref(true);

// Check if user is authenticated
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token');
});

// Check if user already has a channel on mount
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      checkingChannel.value = true;
      await channelStore.fetchMyChannel();
      
      // If user already has a channel, redirect to video upload page
      if (channelStore.myChannel) {
        console.log('User already has a channel, redirecting to video upload page');
        router.push('/videos/upload');
      }
    } catch (error) {
      console.error('Error checking for channel:', error);
      // If there's an error, assume no channel and allow creation
    } finally {
      checkingChannel.value = false;
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
  }
});

// Channel data form
const channelData = ref<CreateChannelRequest>({
  name: '',
  description: '',
  customUrl: '',
  themeColor: '#41A4FF',
});

// Create channel
const createChannel = async () => {
  try {
    await channelStore.createChannel(channelData.value);
    // Redirect to video upload page after successful channel creation
    router.push('/videos/upload');
  } catch (err) {
    console.error('Error creating channel:', err);
    alert('Failed to create channel. Please try again.');
  }
};

</script>

<style scoped>
.create-channel-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.create-channel-page__content {
  margin-top: 24px;
}

.create-channel-page__title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 24px;
  color: var(--text-primary, #1A2233);
}

.create-channel-page__auth-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
}

.create-channel-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
}

.create-channel-page__loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(65, 164, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary, #41A4FF);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.create-channel-page__login-button {
  margin-top: 16px;
  padding: 10px 20px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-channel-page__login-button:hover {
  background-color: var(--secondary, #9067E6);
}

.create-channel-page__form {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 24px;
}

.create-channel-page__form-group {
  margin-bottom: 20px;
}

.create-channel-page__form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary, #1A2233);
}

.create-channel-page__form-input,
.create-channel-page__form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(103, 116, 139, 0.3);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary, #1A2233);
  background-color: white;
}

.create-channel-page__form-textarea {
  min-height: 100px;
  resize: vertical;
}

.create-channel-page__form-help {
  font-size: 12px;
  color: var(--text-secondary, #67748B);
  margin: 4px 0 0;
}

.create-channel-page__custom-url-input {
  display: flex;
  align-items: center;
}

.create-channel-page__custom-url-prefix {
  padding: 10px 0 10px 12px;
  background-color: rgba(103, 116, 139, 0.1);
  border: 1px solid rgba(103, 116, 139, 0.3);
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
  color: var(--text-secondary, #67748B);
}

.create-channel-page__custom-url {
  border-radius: 0 4px 4px 0;
}

.create-channel-page__form-color {
  width: 100px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-channel-page__form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.create-channel-page__form-submit {
  padding: 10px 20px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-channel-page__form-submit:hover {
  background-color: var(--secondary, #9067E6);
}

.create-channel-page__form-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.create-channel-page__form-cancel {
  padding: 10px 20px;
  background-color: transparent;
  color: var(--text-secondary, #67748B);
  border: 1px solid rgba(103, 116, 139, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.create-channel-page__form-cancel:hover {
  background-color: rgba(103, 116, 139, 0.1);
}
</style>