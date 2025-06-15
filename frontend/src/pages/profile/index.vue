<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userApi } from '@/features/auth/api/userApi'
import { userStore } from '@/features/auth/model/userStore'

const { t } = useI18n()

const profile = computed(() => userStore.user.value)
const isLoading = computed(() => userStore.isLoading.value)
const error = ref('')
const successMessage = ref('')
const isProcessing = ref(false) // Use this instead of isLoading which is computed

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
const uploadProgress = ref(0)

onMounted(async () => {
  try {
    await userStore.fetchUserProfile()
    if (profile.value) {
      editedUsername.value = profile.value.username
      editedEmail.value = profile.value.email
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('profile.profileUpdateError')
  }
})

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (isEditMode.value && profile.value) {
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
    
    successMessage.value = t('profile.profileUpdateSuccess')
    isEditMode.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('profile.profileUpdateError')
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
      passwordError.value = t('auth.passwordsDoNotMatch')
      return
    }
    
    isProcessing.value = true
    await userApi.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value
    })
    
    successMessage.value = t('profile.passwordChangeSuccess')
    isChangingPassword.value = false
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    passwordError.value = err instanceof Error ? err.message : t('profile.passwordChangeError')
  } finally {
    isProcessing.value = false
  }
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    // Reset the file input to ensure onChange fires even if the same file is selected
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = t('profile.uploadAvatarError')
      return
    }
    
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      error.value = t('profile.uploadAvatarError')
      return
    }
    
    avatarFile.value = file
    uploadAvatar()
  }
}

const uploadAvatar = async () => {
  if (!avatarFile.value) return;

  try {
    error.value = '';
    successMessage.value = '';
    isUploadingAvatar.value = true;
    uploadProgress.value = 10; // Start progress
    
    if (!avatarFile.value.type.startsWith('image/')) {
      error.value = t('profile.uploadAvatarError');
      return;
    }
    
    // Check file size (2MB limit)
    const twoMB = 2 * 1024 * 1024; // 2MB in bytes
    if (avatarFile.value.size > twoMB) {
      error.value = t('profile.uploadAvatarError');
      return;
    }
    
    // Simulate progress (in a real app, you might use XMLHttpRequest with progress events)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
      }
    }, 200);
    
    await userStore.updateAvatar(avatarFile.value);
    
    clearInterval(progressInterval);
    uploadProgress.value = 100;
    
    successMessage.value = t('profile.avatarUploadSuccess');
  } catch (err) {
    console.error('Avatar upload error:', err);
    error.value = err instanceof Error ? err.message : t('profile.uploadAvatarError');
  } finally {
    setTimeout(() => {
      isUploadingAvatar.value = false;
      uploadProgress.value = 0;
      avatarFile.value = null;
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    }, 500); // Keep progress visible briefly
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
    <h1>{{ $t('profile.myProfile') }}</h1>
    
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>{{ $t('profile.loading') }}</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="profile" class="profile-container">
      <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
      
      <div class="profile-section">
        <h2>{{ $t('profile.personalInfo') }}</h2>
        
        <div class="avatar-section">
          <h3>{{ $t('profile.avatar') }}</h3>
          <div class="avatar-container">
            <img :src="getAvatarUrl" alt="User avatar" class="avatar-image" />
            
            <div v-if="isUploadingAvatar" class="avatar-upload-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
              </div>
              <span>{{ uploadProgress }}%</span>
            </div>
            
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleFileChange"
            />
            
            <button
              class="upload-avatar-btn"
              @click="triggerFileInput"
              :disabled="isUploadingAvatar"
            >
              {{ $t('profile.uploadNewAvatar') }}
            </button>
          </div>
        </div>
        
        <div v-if="!isEditMode" class="profile-info">
          <div class="info-group">
            <span class="info-label">{{ $t('profile.username') }}:</span>
            <span class="info-value">{{ profile.username }}</span>
          </div>
          
          <div class="info-group">
            <span class="info-label">{{ $t('profile.email') }}:</span>
            <span class="info-value">
              {{ profile.email }}
              <span v-if="profile.isEmailVerified" class="verified-badge">✓</span>
              <button
                v-else
                class="verify-email-btn"
                @click="requestEmailVerification"
              >
                {{ $t('auth.verifyEmail') }}
              </button>
            </span>
          </div>
          
          <button class="edit-btn" @click="toggleEditMode">
            {{ $t('profile.editProfile') }}
          </button>
        </div>
        
        <div v-else class="profile-edit-form">
          <div class="form-group">
            <label for="username">{{ $t('profile.username') }}:</label>
            <input
              id="username"
              v-model="editedUsername"
              type="text"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="email">{{ $t('profile.email') }}:</label>
            <input
              id="email"
              v-model="editedEmail"
              type="email"
              class="form-control"
            />
          </div>
          
          <div class="actions">
            <button class="save-btn" @click="saveProfile">{{ $t('profile.save') }}</button>
            <button class="cancel-btn" @click="toggleEditMode">{{ $t('profile.cancel') }}</button>
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <h2>{{ $t('profile.accountSettings') }}</h2>
        
        <button v-if="!isChangingPassword" class="change-password-btn" @click="togglePasswordChange">
          {{ $t('profile.changePassword') }}
        </button>
        
        <div v-if="isChangingPassword" class="password-change">
          <h3>{{ $t('profile.changePassword') }}</h3>
          
          <transition name="fade">
            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>
          </transition>
          
          <div class="form-group">
            <label for="current-password">{{ $t('profile.currentPassword') }}:</label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="new-password">{{ $t('profile.newPassword') }}:</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="confirm-password">{{ $t('profile.confirmNewPassword') }}:</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              class="form-control"
            />
          </div>
          
          <div class="actions">
            <button class="save-btn" :disabled="isLoading || isProcessing" @click="changePassword">
              {{ $t('profile.updatePassword') }}
            </button>
            <button class="cancel-btn" @click="togglePasswordChange">{{ $t('profile.cancel') }}</button>
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

.spinner {
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

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
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
  border-radius: 50%;
  overflow: hidden;
}

.avatar-image {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.avatar-upload-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  border-radius: 50%;
}

.progress-bar {
  width: 80%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}

.upload-avatar-btn {
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
  z-index: 1;
}

.avatar-container:hover .upload-avatar-btn {
  opacity: 1;
}

.file-input {
  display: none;
}

.profile-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.info-group {
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
}

.info-label {
  font-weight: bold;
  width: 150px;
}

.info-value {
  flex: 1;
}

.verified-badge {
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

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .info-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-label {
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