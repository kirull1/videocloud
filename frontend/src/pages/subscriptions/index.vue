<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SubscriptionList } from '@/features/subscriptions';
import { userStore } from '@/features/auth/model/userStore';

const router = useRouter();

// Check if user is authenticated
onMounted(() => {
  if (!userStore.isAuthenticated.value) {
    router.push('/auth/login');
  }
});
</script>

<template>
  <div class="subscriptions-page">
    <h1 class="subscriptions-page__title">Your Subscriptions</h1>
    <SubscriptionList />
  </div>
</template>

<style scoped>
.subscriptions-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.subscriptions-page__title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary, #1A2233);
}

@media (max-width: 768px) {
  .subscriptions-page {
    padding: 16px;
  }
  
  .subscriptions-page__title {
    font-size: 24px;
    margin-bottom: 16px;
  }
}
</style> 