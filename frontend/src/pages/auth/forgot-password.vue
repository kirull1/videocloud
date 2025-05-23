<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ForgotPasswordForm } from '@/features/auth/ui';

const router = useRouter();

const handleSuccess = () => {
  // Success is handled in the form component
  // We'll stay on the same page to show the success message
};

const handleCancel = () => {
  router.push('/auth/login');
};
</script>

<template>
  <div class="forgot-password-page">
    <ForgotPasswordForm
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
.forgot-password-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 24px;
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