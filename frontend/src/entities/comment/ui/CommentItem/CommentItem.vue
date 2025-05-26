<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Comment } from '../../model/types';
import { commentStore } from '../../model/commentStore';

const props = defineProps({
  comment: {
    type: Object as () => Comment,
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['reply', 'edit', 'delete']);

const isEditing = ref(false);
const editContent = ref('');
const showReplies = ref(false);
const isReplying = ref(false);

const formattedDate = computed(() => {
  try {
    const date = new Date(props.comment.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    if (diffDay < 30) return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    if (diffMonth < 12) return `${diffMonth} ${diffMonth === 1 ? 'month' : 'months'} ago`;
    return `${diffYear} ${diffYear === 1 ? 'year' : 'years'} ago`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'some time ago';
  }
});

const hasReplies = computed(() => {
  // Handle the case where repliesCount is undefined
  return props.comment.repliesCount !== undefined && props.comment.repliesCount > 0;
});

const replies = computed(() => {
  if (!props.comment.id || !showReplies.value) return [];
  return commentStore.replies.value[props.comment.id] || [];
});

const startEditing = () => {
  editContent.value = props.comment.content;
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editContent.value = '';
};

const saveEdit = async () => {
  if (editContent.value.trim() === '') return;
  
  try {
    await commentStore.updateComment(props.comment.id, {
      content: editContent.value.trim()
    });
    isEditing.value = false;
  } catch (error) {
    console.error('Failed to update comment:', error);
    
    // Show a user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
    alert(`Error: ${errorMessage}. Please try again.`);
  }
};

const toggleReplies = async () => {
  if (!hasReplies.value) return;
  
  showReplies.value = !showReplies.value;
  
  if (showReplies.value && (!commentStore.replies.value[props.comment.id] || commentStore.replies.value[props.comment.id].length === 0)) {
    try {
      await commentStore.fetchReplies(props.comment.videoId, props.comment.id);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      
      // Show an alert with a more user-friendly message
      alert('Could not load replies. Please try again later.');
      
      // Hide the replies section since we couldn't load them
      showReplies.value = false;
    }
  }
};

const toggleReplyForm = () => {
  isReplying.value = !isReplying.value;
};

const handleReply = () => {
  emit('reply', props.comment.id);
  toggleReplyForm();
};

const handleEdit = () => {
  emit('edit', props.comment.id);
  startEditing();
};

const handleDelete = () => {
  try {
    emit('delete', props.comment.id);
  } catch (error) {
    console.error('Failed to delete comment:', error);
    
    // Show a user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
    alert(`Error: ${errorMessage}. Please try again.`);
  }
};

// Check if the current user is the author of the comment
const isCurrentUser = computed(() => {
  const userId = localStorage.getItem('userId');
  return userId === props.comment.userId;
});
</script>

<template>
  <div class="comment" :class="{ 'comment--reply': isReply }">
    <div class="comment__avatar">
      <img 
        :src="comment.userAvatarUrl || `/api/users/${comment.userId}/avatar`" 
        :alt="comment.username" 
        class="comment__avatar-img"
      />
    </div>
    
    <div class="comment__content">
      <div class="comment__header">
        <span class="comment__username">{{ comment.username }}</span>
        <span class="comment__date">{{ formattedDate }}</span>
      </div>
      
      <div v-if="!isEditing" class="comment__text">
        {{ comment.content }}
      </div>
      
      <div v-else class="comment__edit-form">
        <textarea 
          v-model="editContent"
          class="comment__edit-textarea"
          placeholder="Edit your comment..."
          rows="3"
        />
        
        <div class="comment__edit-actions">
          <button 
            class="comment__button comment__button--cancel"
            @click="cancelEditing"
          >
            Cancel
          </button>
          <button 
            class="comment__button comment__button--save"
            :disabled="editContent.trim() === ''"
            @click="saveEdit"
          >
            Save
          </button>
        </div>
      </div>
      
      <div class="comment__actions">
        <button 
          v-if="!isReply"
          class="comment__action-button"
          @click="toggleReplyForm"
        >
          Reply
        </button>
        
        <button 
          v-if="isCurrentUser"
          class="comment__action-button"
          @click="handleEdit"
        >
          Edit
        </button>
        
        <button 
          v-if="isCurrentUser"
          class="comment__action-button comment__action-button--delete"
          @click="handleDelete"
        >
          Delete
        </button>
      </div>
      
      <div v-if="isReplying" class="comment__reply-form">
        <slot name="reply-form" :parent-id="comment.id" :on-cancel="toggleReplyForm"/>
      </div>
      
      <div v-if="hasReplies && !isReply" class="comment__replies-toggle">
        <button 
          class="comment__replies-button"
          @click="toggleReplies"
        >
          <span v-if="!showReplies">Show {{ comment.repliesCount || 0 }} {{ (comment.repliesCount === 1) ? 'reply' : 'replies' }}</span>
          <span v-else>Hide replies</span>
        </button>
      </div>
      
      <div v-if="showReplies && !isReply" class="comment__replies">
        <div v-if="commentStore.isLoading.value" class="comment__replies-loading">
          Loading replies...
        </div>
        
        <template v-else>
          <CommentItem
            v-for="reply in replies"
            :key="reply.id"
            :comment="reply"
            :is-reply="true"
            @reply="$emit('reply', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          >
            <template #reply-form>
              <slot name="reply-form" :parent-id="reply.id" :on-cancel="toggleReplyForm"/>
            </template>
          </CommentItem>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment {
  display: flex;
  margin-bottom: 24px;
  font-family: 'Rubik', sans-serif;
}

.comment--reply {
  margin-left: 24px;
  margin-bottom: 16px;
}

.comment__avatar {
  flex-shrink: 0;
  margin-right: 16px;
}

.comment__avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--panel-bg, #E6F0FB);
}

.comment__content {
  flex-grow: 1;
  min-width: 0;
}

.comment__header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.comment__username {
  font-weight: 500;
  font-size: 14px;
  color: var(--text-primary, #1A2233);
  margin-right: 8px;
}

.comment__date {
  font-size: 12px;
  color: var(--text-secondary, #67748B);
}

.comment__text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary, #1A2233);
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment__actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.comment__action-button {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: var(--text-secondary, #67748B);
  cursor: pointer;
  transition: color 0.2s;
}

.comment__action-button:hover {
  color: var(--primary, #41A4FF);
}

.comment__action-button--delete:hover {
  color: var(--error, #FF677B);
}

.comment__edit-form {
  margin-top: 8px;
}

.comment__edit-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--panel-bg, #E6F0FB);
  border-radius: 4px;
  font-family: 'Rubik', sans-serif;
  font-size: 14px;
  resize: vertical;
  background-color: white;
  color: var(--text-primary, #1A2233);
}

.comment__edit-textarea:focus {
  outline: none;
  border-color: var(--primary, #41A4FF);
}

.comment__edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.comment__button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.comment__button--cancel {
  background-color: transparent;
  color: var(--text-secondary, #67748B);
  border: 1px solid var(--text-secondary, #67748B);
}

.comment__button--cancel:hover {
  color: var(--text-primary, #1A2233);
  border-color: var(--text-primary, #1A2233);
}

.comment__button--save {
  background-color: var(--primary, #41A4FF);
  color: white;
  border: none;
}

.comment__button--save:hover {
  background-color: var(--secondary, #9067E6);
}

.comment__button--save:disabled {
  background-color: var(--text-secondary, #67748B);
  cursor: not-allowed;
}

.comment__reply-form {
  margin-top: 16px;
  margin-bottom: 16px;
}

.comment__replies-toggle {
  margin-top: 8px;
}

.comment__replies-button {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: var(--primary, #41A4FF);
  cursor: pointer;
  transition: color 0.2s;
}

.comment__replies-button:hover {
  color: var(--secondary, #9067E6);
}

.comment__replies {
  margin-top: 16px;
}

.comment__replies-loading {
  font-size: 12px;
  color: var(--text-secondary, #67748B);
  margin-left: 24px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .comment--reply {
    margin-left: 16px;
  }
  
  .comment__avatar-img {
    width: 32px;
    height: 32px;
  }
  
  .comment__avatar {
    margin-right: 12px;
  }
}

@media (max-width: 480px) {
  .comment--reply {
    margin-left: 8px;
  }
  
  .comment__actions {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>