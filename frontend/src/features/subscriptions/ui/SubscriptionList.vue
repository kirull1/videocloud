<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { subscriptionApi } from '../';
import { getAvatarUrl } from '@/shared/lib/avatar';

const router = useRouter();
const { t } = useI18n();
const isLoading = ref(true);
const error = ref<string | null>(null);
const subscriptions = ref<any[]>([]);

// Load user's subscriptions
const loadSubscriptions = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await subscriptionApi.getSubscribedChannels();
    subscriptions.value = response.items;
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('subscriptions.loadError');
  } finally {
    isLoading.value = false;
  }
};

// Navigate to channel page
const navigateToChannel = (channelId: string) => {
  router.push({
    name: 'channel-detail',
    params: { id: channelId }
  });
};

// Unsubscribe from channel
const unsubscribe = async (channelId: string, index: number) => {
  try {
    await subscriptionApi.unsubscribeFromChannel(channelId);
    
    // Remove from list
    subscriptions.value.splice(index, 1);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'subscription-list__success-message';
    successMessage.textContent = t('subscriptions.unsubscribeSuccess');
    document.body.appendChild(successMessage);
    
    // Remove the success message after 3 seconds
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('subscriptions.unsubscribeError');
  }
};

// Load subscriptions on mount
onMounted(loadSubscriptions);
</script>

<template>
  <div class="subscription-list">
    <h2 class="subscription-list__title">{{ t('subscriptions.yourSubscriptions') }}</h2>
    
    <div v-if="isLoading" class="subscription-list__loading">
      <div class="subscription-list__loading-spinner"/>
      <p>{{ t('subscriptions.loadingSubscriptions') }}</p>
    </div>
    
    <div v-else-if="error" class="subscription-list__error">
      <div class="subscription-list__error-icon">!</div>
      <p>{{ error }}</p>
      <button class="subscription-list__retry-button" @click="loadSubscriptions">
        {{ t('common.retry') }}
      </button>
    </div>
    
    <div v-else-if="subscriptions.length === 0" class="subscription-list__empty">
      <p>{{ t('subscriptions.noSubscriptions') }}</p>
      <button class="subscription-list__browse-button" @click="router.push('/')">
        {{ t('subscriptions.exploreChannels') }}
      </button>
    </div>
    
    <div v-else class="subscription-list__grid">
      <div 
        v-for="(subscription, index) in subscriptions" 
        :key="subscription.id" 
        class="subscription-list__item"
      >
        <div class="subscription-list__channel" @click="navigateToChannel(subscription.channelId)">
          <img 
            :src="getAvatarUrl(undefined, subscription.channelName, 48)" 
            alt="Channel avatar" 
            class="subscription-list__avatar"
          />
          <div class="subscription-list__info">
            <h3 class="subscription-list__name">{{ subscription.channelName }}</h3>
            <p class="subscription-list__date">
              {{ t('subscriptions.subscribedOn') }} {{ new Date(subscription.subscribedAt).toLocaleDateString() }}
            </p>
          </div>
        </div>
        
        <button 
          class="subscription-list__unsubscribe-button" 
          @click="unsubscribe(subscription.channelId, index)"
        >
          {{ t('channel.unsubscribe') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subscription-list {
  margin-bottom: 24px;
}

.subscription-list__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary, #1A2233);
}

.subscription-list__loading,
.subscription-list__error,
.subscription-list__empty {
  padding: 24px;
  text-align: center;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
}

.subscription-list__loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(65, 164, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary, #41A4FF);
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.subscription-list__error-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--error, #FF677B);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin: 0 auto 16px;
}

.subscription-list__retry-button,
.subscription-list__browse-button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.subscription-list__retry-button:hover,
.subscription-list__browse-button:hover {
  background-color: var(--secondary, #9067E6);
}

.subscription-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.subscription-list__item {
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subscription-list__channel {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.subscription-list__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.subscription-list__info {
  flex: 1;
  min-width: 0;
}

.subscription-list__name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px;
  color: var(--text-primary, #1A2233);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subscription-list__date {
  font-size: 12px;
  margin: 0;
  color: var(--text-secondary, #67748B);
}

.subscription-list__unsubscribe-button {
  padding: 6px 12px;
  background-color: transparent;
  color: var(--error, #FF677B);
  border: 1px solid var(--error, #FF677B);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  margin-left: 8px;
  white-space: nowrap;
}

.subscription-list__unsubscribe-button:hover {
  background-color: var(--error, #FF677B);
  color: white;
}

.subscription-list__success-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--success, #8FF6E9);
  color: #155724;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .subscription-list__grid {
    grid-template-columns: 1fr;
  }
  
  .subscription-list__item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .subscription-list__channel {
    margin-bottom: 12px;
    width: 100%;
  }
  
  .subscription-list__unsubscribe-button {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style> 