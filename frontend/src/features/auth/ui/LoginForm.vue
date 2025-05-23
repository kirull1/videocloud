<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="emailOrUsername">Email or Username</label>
      <input
        id="emailOrUsername"
        v-model="form.emailOrUsername"
        type="text"
        :class="{ error: errors.emailOrUsername }"
        @input="clearError('emailOrUsername')"
      />
      <span v-if="errors.emailOrUsername" class="error-message">{{ errors.emailOrUsername }}</span>
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        :class="{ error: errors.password }"
        @input="clearError('password')"
      />
      <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
    </div>

    <transition name="fade">
      <div v-if="error" class="form-error">
        <span class="error-icon">!</span>
        {{ error }}
      </div>
    </transition>

    <button type="submit" :disabled="isLoading" class="submit-button">
      <span v-if="isLoading" class="spinner"/>
      <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
    </button>

    <div class="form-footer">
      <router-link to="/auth/register">Don't have an account? Sign up</router-link>
      <router-link to="/auth/forgot-password">Forgot password?</router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '../api/authApi';
import { userStore } from '../model/userStore';

const router = useRouter();

const form = reactive({
  emailOrUsername: '',
  password: '',
});

const errors = reactive({
  emailOrUsername: '',
  password: '',
});

const error = ref('');
const isLoading = ref(false);

const validateForm = () => {
  let isValid = true;

  if (!form.emailOrUsername) {
    errors.emailOrUsername = 'Email or username is required';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
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

    const { accessToken } = await authApi.login(form);
    localStorage.setItem('token', accessToken);
    
    // Initialize user store to fetch user data
    await userStore.fetchUserProfile();
    
    // Redirect to home page or the original intended destination with page refresh
    const redirectPath = router.currentRoute.value.query.redirect as string || '/';
    window.location.href = redirectPath; // Use window.location for full page refresh
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-form {
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
  display: flex;
  justify-content: space-between;
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