<template>
  <form class="register-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="email">{{ $t('auth.emailPlaceholder') }}</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :class="{ error: errors.email }"
        @input="clearError('email')"
      />
      <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
    </div>

    <div class="form-group">
      <label for="username">{{ $t('auth.usernamePlaceholder') }}</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        :class="{ error: errors.username }"
        @input="clearError('username')"
      />
      <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
    </div>

    <div class="form-group">
      <label for="password">{{ $t('auth.password') }}</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        :class="{ error: errors.password }"
        @input="clearError('password')"
      />
      <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
    </div>

    <div class="form-group">
      <label for="confirmPassword">{{ $t('auth.confirmPassword') }}</label>
      <input
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        :class="{ error: errors.confirmPassword }"
        @input="clearError('confirmPassword')"
      />
      <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
    </div>

    <transition name="fade">
      <div v-if="error" class="form-error">
        <span class="error-icon">!</span>
        {{ error }}
      </div>
    </transition>

    <button type="submit" :disabled="isLoading" class="submit-button">
      <span v-if="isLoading" class="spinner"/>
      <span>{{ isLoading ? $t('auth.creatingAccount') : $t('auth.signUp') }}</span>
    </button>

    <div class="form-footer">
      <router-link to="/auth/login">{{ $t('auth.alreadyHaveAccount') }} {{ $t('auth.signIn') }}</router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { authApi } from '../api/authApi';
import { userStore } from '../model/userStore';

const router = useRouter();
const { t } = useI18n();

const form = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
});

const errors = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
});

const error = ref('');
const isLoading = ref(false);

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateUsername = (username: string): boolean => {
  const re = /^[a-zA-Z0-9_-]{3,20}$/;
  return re.test(username);
};

const validatePassword = (password: string): boolean => {
  // Minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
  return re.test(password);
};

const validateForm = () => {
  let isValid = true;

  if (!form.email) {
    errors.email = t('errors.required');
    isValid = false;
  } else if (!validateEmail(form.email)) {
    errors.email = t('auth.emailInvalid');
    isValid = false;
  }

  if (!form.username) {
    errors.username = t('errors.required');
    isValid = false;
  } else if (!validateUsername(form.username)) {
    errors.username = t('auth.usernameInvalid');
    isValid = false;
  }

  if (!form.password) {
    errors.password = t('errors.required');
    isValid = false;
  } else if (!validatePassword(form.password)) {
    errors.password = t('auth.passwordInvalid');
    isValid = false;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = t('auth.confirmPasswordRequired');
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('auth.passwordsDoNotMatch');
    isValid = false;
  }

  return isValid;
};

const clearError = (field: keyof typeof errors) => {
  errors[field] = '';
  error.value = '';
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    error.value = '';

    const { accessToken } = await authApi.register({
      email: form.email,
      username: form.username,
      password: form.password,
    });

    localStorage.setItem('token', accessToken);
    
    // Initialize user store to fetch user data
    await userStore.fetchUserProfile();
    
    // Redirect to home page with page refresh
    window.location.href = '/';
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('auth.registerError');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-error {
  color: #dc3545;
  margin-bottom: 1rem;
  text-align: center;
  background-color: #f8d7da;
  padding: 0.75rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  margin-right: 0.5rem;
  font-weight: bold;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.submit-button:hover {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.form-footer a {
  color: #007bff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style> 