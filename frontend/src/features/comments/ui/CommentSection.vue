<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { commentStore, CommentItem, CommentForm } from '@/entities/comment';

const props = defineProps({
  videoId: {
    type: String,
    required: true
  }
});

const isLoading = ref(false);
const error = ref<string | null>(null);

// Load comments when component is mounted
onMounted(async () => {
  await loadComments();
});

// Watch for changes in videoId and reload comments
watch(() => props.videoId, async (newVideoId) => {
  if (newVideoId) {
    await loadComments();
  }
});

// Load comments for the video
const loadComments = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    await commentStore.fetchComments(props.videoId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load comments';
    console.error('Failed to load comments:', err);
  } finally {
    isLoading.value = false;
  }
};

// Handle reply to comment
const handleReply = (commentId: string) => {
  console.log(`Replying to comment: ${commentId}`);
  // The reply form is shown/hidden by the CommentItem component
};

// Handle edit comment
const handleEdit = (commentId: string) => {
  console.log(`Editing comment: ${commentId}`);
  // The edit form is shown/hidden by the CommentItem component
};

// Handle delete comment
const handleDelete = async (commentId: string) => {
  if (!confirm('Are you sure you want to delete this comment?')) return;
  
  try {
    isLoading.value = true;
    await commentStore.deleteComment(commentId);
    // Show a success message
    const successMessage = document.createElement('div');
    successMessage.className = 'comment-section__success-message';
    successMessage.textContent = 'Comment deleted successfully';
    document.body.appendChild(successMessage);
    
    // Remove the success message after 3 seconds
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  } catch (err) {
    console.error('Failed to delete comment:', err);
    error.value = err instanceof Error ? err.message : 'Failed to delete comment';
    
    // Scroll to the error message
    setTimeout(() => {
      const errorElement = document.querySelector('.comment-section__error');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  } finally {
    isLoading.value = false;
  }
};

// Handle comment form submission
const handleCommentSubmit = () => {
  // The comment is already added to the store by the CommentForm component
  console.log('Comment submitted');
};
</script>

<template>
  <div class="comment-section">
    <h2 class="comment-section__title">Comments</h2>
    
    <div class="comment-section__form">
      <CommentForm
        :video-id="videoId"
        placeholder="Add a comment..."
        submit-label="Comment"
        @submit="handleCommentSubmit"
      />
    </div>
    
    <div v-if="isLoading" class="comment-section__loading">
      <div class="comment-section__loading-spinner"/>
      <p>Loading comments...</p>
    </div>
    
    <div v-else-if="error" class="comment-section__error">
      <div class="comment-section__error-icon">!</div>
      <p>{{ error }}</p>
      <button class="comment-section__retry-button" @click="loadComments">
        Retry
      </button>
    </div>
    
    <div v-else-if="commentStore.comments.value.length === 0" class="comment-section__empty">
      No comments yet. Be the first to comment!
    </div>
    
    <div v-else class="comment-section__list">
      <CommentItem
        v-for="comment in commentStore.rootComments.value"
        :key="comment.id"
        :comment="comment"
        @reply="handleReply"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <template #reply-form="{ parentId, onCancel }">
          <CommentForm
            :video-id="videoId"
            :parent-id="parentId"
            placeholder="Add a reply..."
            submit-label="Reply"
            cancel-label="Cancel"
            :show-cancel="true"
            @cancel="onCancel"
            @submit="() => {
              handleCommentSubmit();
              onCancel();
            }"
          />
        </template>
      </CommentItem>
    </div>
  </div>
</template>

<style scoped>
.comment-section {
  margin-top: 32px;
  font-family: 'Rubik', sans-serif;
}

.comment-section__title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary, #1A2233);
}

.comment-section__form {
  margin-bottom: 32px;
}

.comment-section__loading,
.comment-section__error,
.comment-section__empty {
  padding: 24px;
  text-align: center;
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 8px;
  color: var(--text-secondary, #67748B);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.comment-section__loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(65, 164, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary, #41A4FF);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.comment-section__error {
  color: var(--error, #FF677B);
}

.comment-section__error-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--error, #FF677B);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

.comment-section__retry-button {
  margin-left: 8px;
  padding: 4px 8px;
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.comment-section__retry-button:hover {
  background-color: var(--secondary, #9067E6);
}

.comment-section__list {
  display: flex;
  flex-direction: column;
}

/* Success message */
.comment-section__success-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--success, #8FF6E9);
  color: #155724;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

@media (max-width: 768px) {
  .comment-section__title {
    font-size: 18px;
  }
  
  .comment-section__success-message {
    left: 20px;
    right: 20px;
    text-align: center;
  }
}
</style>