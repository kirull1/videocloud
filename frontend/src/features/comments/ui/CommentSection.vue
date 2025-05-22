<script setup lang="ts">
import { onMounted, ref } from 'vue';
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
    await commentStore.deleteComment(commentId);
  } catch (err) {
    console.error('Failed to delete comment:', err);
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
      Loading comments...
    </div>
    
    <div v-else-if="error" class="comment-section__error">
      {{ error }}
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
            @submit="onCancel"
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
}

.comment-section__error {
  color: var(--error, #FF677B);
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

@media (max-width: 768px) {
  .comment-section__title {
    font-size: 18px;
  }
}
</style>