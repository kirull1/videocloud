<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { userApi } from '@/features/auth/api/userApi'
import { userStore } from '@/features/auth/model/userStore'

const profile = computed(() => userStore.user.value)
const isLoading = computed(() => userStore.isLoading.value)
const error = ref('')
const successMessage = ref('')

// Form state
const isEditMode = ref(false)
const editedUsername = ref('')
const editedEmail = ref('')

// Password change state
const isChangingPassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

// Avatar upload state
const isUploadingAvatar = ref(false)
const avatarFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  try {
    await userStore.fetchUserProfile()
    if (profile.value) {
      editedUsername.value = profile.value.username
      editedEmail.value = profile.value.email
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load profile'
  }
})

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (isEditMode.value) {
    editedUsername.value = profile.value.username
    editedEmail.value = profile.value.email
  }
}

const saveProfile = async () => {
  if (!profile.value) return
  
  try {
    error.value = ''
    successMessage.value = ''
    
    await userStore.updateUserProfile({
      username: editedUsername.value !== profile.value.username ? editedUsername.value : undefined,
      email: editedEmail.value !== profile.value.email ? editedEmail.value : undefined
    })
    
    successMessage.value = 'Profile updated successfully'
    isEditMode.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update profile'
  }
}

const togglePasswordChange = () => {
  isChangingPassword.value = !isChangingPassword.value
  if (isChangingPassword.value) {
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordError.value = ''
  }
}

const changePassword = async () => {
  try {
    passwordError.value = ''
    successMessage.value = ''
    
    if (newPassword.value !== confirmPassword.value) {
      passwordError.value = 'Passwords do not match'
      return
    }
    
    isLoading.value = true
    await userApi.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value
    })
    
    successMessage.value = 'Password changed successfully'
    isChangingPassword.value = false
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    passwordError.value = err instanceof Error ? err.message : 'Failed to change password'
  } finally {
    isLoading.value = false
  }
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    avatarFile.value = input.files[0]
    uploadAvatar()
  }
}

const uploadAvatar = async () => {
  if (!avatarFile.value) return
  
  try {
    error.value = ''
    successMessage.value = ''
    isUploadingAvatar.value = true
    
    await userStore.updateAvatar(avatarFile.value)
    successMessage.value = 'Avatar uploaded successfully'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to upload avatar'
  } finally {
    isUploadingAvatar.value = false
    avatarFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

const requestEmailVerification = async () => {
  if (!profile.value || profile.value.isEmailVerified) return
  
  try {
    error.value = ''
    successMessage.value = ''
    
    const result = await userApi.requestEmailVerification()
    successMessage.value = result.message
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to request email verification'
  }
}

const getAvatarUrl = computed(() => {
  return userStore.avatarUrl.value
})
</script>

<template>
  <div class="profile-page">
    <h1>User Profile</h1>
    
    <div v-if="isLoading && !profile" class="loading">
      <div class="loading-spinner"/>
      <p>Loading profile...</p>
    </div>
    
    <div v-else-if="error && !profile" class="error">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="userStore.fetchUserProfile()">Retry</button>
    </div>
    
    <div v-else-if="profile" class="profile-container">
      <transition name="fade">
        <div v-if="successMessage" class="success-message">
          <span class="success-icon">✓</span>
          {{ successMessage }}
        </div>
      </transition>
      
      <div class="avatar-section">
        <div class="avatar-container">
          <img :src="getAvatarUrl" alt="User avatar" class="avatar" />
          <button class="change-avatar-btn" @click="triggerFileInput">
            Change Avatar
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="file-input"
            @change="handleFileChange"
          />
        </div>
      </div>
      
      <div class="profile-details">
        <div v-if="!isEditMode" class="view-mode">
          <div class="detail-row">
            <span class="label">Username:</span>
            <span class="value">{{ profile.username }}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">{{ profile.email }}</span>
            <span v-if="profile.isEmailVerified" class="verified">Verified</span>
            <button 
              v-else 
              class="verify-email-btn"
              :disabled="isLoading"
              @click="requestEmailVerification"
            >
              Verify Email
            </button>
          </div>
          
          <div class="detail-row">
            <span class="label">Member Since:</span>
            <span class="value">{{ new Date(profile.createdAt).toLocaleDateString() }}</span>
          </div>
          
          <div class="actions">
            <button class="edit-btn" @click="toggleEditMode">Edit Profile</button>
            <button class="password-btn" @click="togglePasswordChange">Change Password</button>
          </div>
        </div>
        
        <div v-else class="edit-mode">
          <div class="form-group">
            <label for="username">Username:</label>
            <input
              id="username"
              v-model="editedUsername"
              type="text"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email:</label>
            <input
              id="email"
              v-model="editedEmail"
              type="email"
              class="form-control"
            />
            <small class="form-text">
              Changing your email will require verification.
            </small>
          </div>
          
          <div class="actions">
            <button class="save-btn" :disabled="isLoading" @click="saveProfile">
              Save Changes
            </button>
            <button class="cancel-btn" @click="toggleEditMode">Cancel</button>
          </div>
        </div>
        
        <div v-if="isChangingPassword" class="password-change">
          <h3>Change Password</h3>
          
          <transition name="fade">
            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>
          </transition>
          
          <div class="form-group">
            <label for="current-password">Current Password:</label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="new-password">New Password:</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="confirm-password">Confirm New Password:</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              class="form-control"
            />
          </div>
          
          <div class="actions">
            <button class="save-btn" :disabled="isLoading" @click="changePassword">
              Update Password
            </button>
            <button class="cancel-btn" @click="togglePasswordChange">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 123, 255, 0.1);
  border-radius: 50%;
  border-top-color: #007bff;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.success-icon {
  margin-right: 0.5rem;
  font-weight: bold;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.avatar-section {
  display: flex;
  justify-content: center;
}

.avatar-container {
  position: relative;
  width: 128px;
  height: 128px;
}

.avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .change-avatar-btn {
  opacity: 1;
}

.file-input {
  display: none;
}

.profile-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
}

.label {
  font-weight: bold;
  width: 150px;
}

.verified {
  margin-left: 1rem;
  background-color: #28a745;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.verify-email-btn {
  margin-left: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: none;
}

.edit-btn, .save-btn {
  background-color: #007bff;
  color: white;
}

.password-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.password-change {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .label {
    width: 100%;
    margin-bottom: 0.25rem;
  }
  
  .verify-email-btn {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  button {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>