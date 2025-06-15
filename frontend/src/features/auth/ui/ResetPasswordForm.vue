<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { userApi } from '../api/userApi';

const { t } = useI18n();

const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const emit = defineEmits(['success', 'cancel']);

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value;
});

const isPasswordValid = computed(() => {
  if (!password.value) return true;
  
  // At least 8 characters, one uppercase, one lowercase, one number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password.value);
});

const handleSubmit = async () => {
  // Validate inputs
  if (!password.value) {
    error.value = t('auth.pleaseEnterPassword');
    return;
  }
  
  if (!isPasswordValid.value) {
    error.value = t('auth.passwordInvalid');
    return;
  }
  
  if (!passwordsMatch.value) {
    error.value = t('auth.passwordsDoNotMatch');
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await userApi.resetPassword({
      token: props.token,
      password: password.value,
      confirmPassword: confirmPassword.value
    });
    
    successMessage.value = response.message || t('auth.resetPasswordSuccess');
    emit('success');
  } catch (err: any) {
    error.value = err.message || t('auth.resetPasswordError');
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="reset-password-form">
    <h2 class="form-title">{{ $t('auth.resetPasswordPage') }}</h2>
    
    <p class="form-description">
      {{ $t('auth.resetPasswordDescription') }}
    </p>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
      <div class="success-actions">
        <button class="login-button" @click="emit('success')">
          {{ $t('auth.goToLogin') }}
        </button>
      </div>
    </div>
    
    <form v-else class="form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="password" class="form-label">{{ $t('auth.newPassword') }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="form-input"
          :placeholder="$t('auth.enterNewPassword')"
          :disabled="isLoading"
        />
        <div v-if="password && !isPasswordValid" class="input-error">
          {{ $t('auth.passwordInvalid') }}
        </div>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword" class="form-label">{{ $t('auth.confirmPassword') }}</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          class="form-input"
          :placeholder="$t('auth.confirmNewPassword')"
          :disabled="isLoading"
        />
        <div v-if="confirmPassword && !passwordsMatch" class="input-error">
          {{ $t('auth.passwordsDoNotMatch') }}
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="form-actions">
        <button
          type="button"
          class="cancel-button"
          :disabled="isLoading"
          @click="handleCancel"
        >
          {{ $t('auth.cancel') }}
        </button>
        
        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading || !isPasswordValid || !passwordsMatch"
        >
          <span v-if="isLoading" class="loading-spinner"/>
          <span v-else>{{ $t('auth.resetPasswordButton') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.reset-password-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--panel-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
  text-align: center;
}

.form-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  height: 40px;
  padding: 0 16px;
  border-radius: 4px;
  border: 1px solid var(--panel-bg);
  background-color: var(--video-bg);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(65, 164, 255, 0.2);
}

.form-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-error {
  font-size: 12px;
  color: var(--error);
  margin-top: 4px;
}

.error-message {
  padding: 12px;
  background-color: var(--error-bg);
  color: var(--error);
  border-radius: 4px;
  font-size: 14px;
}

.success-message {
  padding: 16px;
  background-color: #e6f7e6;
  color: #2e7d32;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
}

.success-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.login-button {
  height: 40px;
  padding: 0 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--primary);
  color: white;
  border: none;
  min-width: 120px;
}

.login-button:hover {
  background-color: #3b96eb;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.submit-button,
.cancel-button {
  height: 40px;
  padding: 0 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.submit-button {
  background-color: var(--primary);
  color: white;
  border: none;
}

.submit-button:hover {
  background-color: #3b96eb;
}

.cancel-button {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--panel-bg);
}

.cancel-button:hover {
  background-color: var(--panel-bg);
  color: var(--text-primary);
}

.submit-button:disabled,
.cancel-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .reset-password-form {
    padding: 16px;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .submit-button,
  .cancel-button {
    width: 100%;
  }
}
</style>