<script setup lang="ts">
defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  userName: {
    type: String,
    default: ''
  },
});

const emit = defineEmits(['login', 'signup', 'logout']);

const handleLogin = () => {
  emit('login');
};

const handleSignup = () => {
  emit('signup');
};

const handleLogout = () => {
  emit('logout');
};
</script>

<template>
  <div class="auth">
    <template v-if="isAuthenticated">
      <div class="auth__user">
        <div class="auth__avatar">
          <span>{{ userName.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="auth__name">{{ userName }}</span>
        <button class="auth__button auth__button--logout" @click="handleLogout">
          <svg
            class="auth__icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21"
                  y1="12"
                  x2="9"
                  y2="12" />
          </svg>
        </button>
      </div>
    </template>
    <template v-else>
      <div class="auth__buttons">
        <button class="auth__button auth__button--login" @click="handleLogin">Log in</button>
        <button class="auth__button auth__button--signup" @click="handleSignup">Sign up</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  align-items: center;
}

.auth__buttons {
  display: flex;
  gap: 8px;
}

.auth__button {
  padding: 8px 16px;
  border-radius: 4px;
  font-family: 'Rubik', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.auth__button--login {
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid var(--panel-bg);
}

.auth__button--login:hover {
  background-color: var(--panel-bg);
}

.auth__button--signup {
  background-color: var(--primary);
  color: white;
}

.auth__button--signup:hover {
  background-color: #3b96eb;
}

.auth__user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--panel-bg);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-weight: 500;
}

.auth__name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.auth__button--logout {
  background-color: transparent;
  padding: 4px;
  color: var(--text-secondary);
}

.auth__button--logout:hover {
  color: var(--text-primary);
}

.auth__icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .auth__name {
    display: none;
  }
  
  .auth__button {
    padding: 6px 12px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .auth__button--login {
    display: none;
  }
}
</style>