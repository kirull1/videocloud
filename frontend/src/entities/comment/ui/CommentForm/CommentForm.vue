<script setup lang="ts">
import { ref, computed } from 'vue';
import { commentStore } from '../../model/commentStore';

const props = defineProps({
  videoId: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: 'Add a comment...'
  },
  submitLabel: {
    type: String,
    default: 'Comment'
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  },
  showCancel: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['cancel', 'submit']);

const content = ref('');
const isSubmitting = ref(false);
const error = ref<string | null>(null);

const handleSubmit = async () => {
  if (content.value.trim() === '') return;
  
  try {
    isSubmitting.value = true;
    error.value = null;
    
    const commentData = {
      content: content.value.trim(),
      videoId: props.videoId,
    };
    
    // Add parentId if it's a reply
    if (props.parentId) {
      console.log('Creating a reply to parent:', props.parentId);
      Object.assign(commentData, { parentId: props.parentId });
    } else {
      console.log('Creating a new top-level comment');
    }
    
    console.log('Submitting comment data:', commentData);
    await commentStore.createComment(commentData);
    content.value = '';
    emit('submit');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to post comment';
    console.error('Failed to post comment:', err);
    
    // Auto-retry after 2 seconds if it's a network error
    if (err instanceof Error && err.message.includes('network')) {
      setTimeout(() => {
        handleSubmit();
      }, 2000);
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  content.value = '';
  emit('cancel');
};

// Check if user is authenticated
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token');
});
</script>

<template>
  <div class="comment-form">
    <div v-if="!isAuthenticated" class="comment-form__auth-message">
      Please sign in to post comments.
    </div>
    
    <form v-else class="comment-form__form" @submit.prevent="handleSubmit">
      <textarea
        v-model="content"
        class="comment-form__textarea"
        :placeholder="placeholder"
        :disabled="isSubmitting"
        rows="3"
      />
      
      <div v-if="error" class="comment-form__error">
        {{ error }}
      </div>
      
      <div class="comment-form__actions">
        <button
          v-if="showCancel"
          type="button"
          class="comment-form__button comment-form__button--cancel"
          :disabled="isSubmitting"
          @click="handleCancel"
        >
          {{ cancelLabel }}
        </button>
        
        <button
          type="submit"
          class="comment-form__button comment-form__button--submit"
          :disabled="content.trim() === '' || isSubmitting"
        >
          <span v-if="isSubmitting">Posting...</span>
          <span v-else>{{ submitLabel }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.comment-form {
  margin-bottom: 24px;
  font-family: 'Rubik', sans-serif;
}

.comment-form__auth-message {
  padding: 12px;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-secondary, #67748B);
  text-align: center;
}

.comment-form__form {
  display: flex;
  flex-direction: column;
}

.comment-form__textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--panel-bg, #E6F0FB);
  border-radius: 4px;
  font-family: 'Rubik', sans-serif;
  font-size: 14px;
  resize: vertical;
  background-color: white;
  color: var(--text-primary, #1A2233);
  margin-bottom: 8px;
}

.comment-form__textarea:focus {
  outline: none;
  border-color: var(--primary, #41A4FF);
}

.comment-form__textarea:disabled {
  background-color: var(--panel-bg, #E6F0FB);
  cursor: not-allowed;
}

.comment-form__error {
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: rgba(255, 103, 123, 0.1);
  border-radius: 4px;
  font-size: 12px;
  color: var(--error, #FF677B);
}

.comment-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.comment-form__button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.comment-form__button--cancel {
  background-color: transparent;
  color: var(--text-secondary, #67748B);
  border: 1px solid var(--text-secondary, #67748B);
}

.comment-form__button--cancel:hover {
  color: var(--text-primary, #1A2233);
  border-color: var(--text-primary, #1A2233);
}

.comment-form__button--cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-form__button--submit {
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
}

.comment-form__button--submit:hover {
  background-color: var(--secondary, #9067E6);
}

.comment-form__button--submit:disabled {
  background-color: var(--text-secondary, #67748B);
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .comment-form__button {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>