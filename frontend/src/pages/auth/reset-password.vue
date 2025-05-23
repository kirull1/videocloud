<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { ResetPasswordForm } from '@/features/auth/ui';

const router = useRouter();
const route = useRoute();
const token = ref<string>('');
const error = ref<string | null>(null);

onMounted(() => {
  // Get token from route params or query
  if (route.params.token) {
    token.value = route.params.token as string;
  } else if (route.query.token) {
    token.value = route.query.token as string;
  } else {
    error.value = 'Invalid or missing reset token. Please request a new password reset link.';
  }
});

const handleSuccess = () => {
  // Redirect to login page after successful password reset
  router.push('/auth/login');
};

const handleCancel = () => {
  router.push('/auth/login');
};
</script>

<template>
  <div class="reset-password-page">
    <div v-if="error" class="error-container">
      <div class="error-message">
        {{ error }}
      </div>
      <div class="error-actions">
        <router-link to="/auth/forgot-password" class="request-link">
          Request a new reset link
        </router-link>
      </div>
    </div>
    
    <ResetPasswordForm
      v-else
      :token="token"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
    
    <div class="auth-links">
      <router-link to="/auth/login" class="auth-link">
        Back to Login
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.reset-password-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 24px;
}

.error-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--panel-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-message {
  padding: 12px;
  background-color: var(--error-bg);
  color: var(--error);
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
}

.error-actions {
  margin-top: 16px;
}

.request-link {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--primary);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.request-link:hover {
  background-color: #3b96eb;
}

.auth-links {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.auth-link {
  color: var(--primary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.auth-link:hover {
  color: #3b96eb;
  text-decoration: underline;
}
</style>