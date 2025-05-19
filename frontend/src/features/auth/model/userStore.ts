import { ref, computed } from 'vue'
import { userApi } from '../api/userApi'
import { authApi } from '../api/authApi'
import { getAvatarUrl } from '@/shared/lib/avatar'

interface UserProfile {
  id: string
  username: string
  email: string
  isEmailVerified: boolean
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

// Create a reactive state
const user = ref<UserProfile | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Create computed properties
const isAuthenticated = computed(() => authApi.isAuthenticated())
const username = computed(() => user.value?.username || 'User')
const avatarUrl = computed(() => {
  return getAvatarUrl(user.value?.avatarUrl, username.value)
})

// Actions
async function fetchUserProfile() {
  if (!isAuthenticated.value) {
    return
  }

  try {
    isLoading.value = true
    error.value = null
    user.value = await userApi.getProfile()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch user profile'
    console.error('Error fetching user profile:', err)
  } finally {
    isLoading.value = false
  }
}

async function updateUserProfile(data: { username?: string; email?: string }) {
  if (!isAuthenticated.value) {
    return
  }

  try {
    isLoading.value = true
    error.value = null
    user.value = await userApi.updateProfile(data)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update user profile'
    throw err
  } finally {
    isLoading.value = false
  }
}

async function updateAvatar(file: File) {
  if (!isAuthenticated.value) {
    return
  }

  try {
    isLoading.value = true
    error.value = null
    const result = await userApi.uploadAvatar(file)
    if (user.value) {
      user.value.avatarUrl = result.avatarUrl
    }
    return result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update avatar'
    throw err
  } finally {
    isLoading.value = false
  }
}

async function logout() {
  await authApi.logout()
  user.value = null
}

// Initialize user data if authenticated
function init() {
  if (isAuthenticated.value) {
    fetchUserProfile()
  }
}

// Export the store
export const userStore = {
  // State
  user,
  isLoading,
  error,
  
  // Getters
  isAuthenticated,
  username,
  avatarUrl,
  
  // Actions
  fetchUserProfile,
  updateUserProfile,
  updateAvatar,
  logout,
  init
}