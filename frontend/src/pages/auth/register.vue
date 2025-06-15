<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>{{ $t('auth.createAccount') }}</h1>
      <RegisterForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/features/auth/ui/RegisterForm.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.auth-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 480px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.75rem;
}
</style> 