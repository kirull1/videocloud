<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '../model/userStore'

const router = useRouter()
const isMenuOpen = ref(false)
const isAuthenticated = computed(() => userStore.isAuthenticated.value)
const username = computed(() => userStore.username.value)
const userAvatar = computed(() => userStore.avatarUrl.value)

onMounted(() => {
  userStore.init()
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/auth/login')
  isMenuOpen.value = false
}
</script>

<template>
  <div class="auth">
    <div v-if="!isAuthenticated" class="auth-buttons">
      <router-link to="/auth/login" class="auth-button login">Sign In</router-link>
      <router-link to="/auth/register" class="auth-button register">Sign Up</router-link>
    </div>
    <div v-else class="user-menu">
      <button class="user-button" @click="toggleMenu">
        <img :src="userAvatar" alt="User avatar" class="avatar" />
        <span class="username">{{ username }}</span>
      </button>
      <transition name="menu-fade">
        <div v-if="isMenuOpen" class="menu">
          <router-link to="/profile" class="menu-item">Profile</router-link>
          <router-link to="/settings" class="menu-item">Settings</router-link>
          <button class="menu-item logout" @click="handleLogout">Logout</button>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.auth-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.login {
  color: #007bff;
  border: 1px solid #007bff;
}

.login:hover {
  background-color: #007bff;
  color: white;
}

.register {
  background-color: #007bff;
  color: white;
}

.register:hover {
  background-color: #0056b3;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.username {
  font-weight: 500;
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 150px;
}

.menu-item {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f8f9fa;
}

.logout {
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: #dc3545;
}

.logout:hover {
  background-color: #dc3545;
  color: white;
}

/* Menu animation */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>