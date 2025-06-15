<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Comment } from '../../model/types';
import { commentStore } from '../../model/commentStore';
import { userStore } from '@/features/auth/model/userStore';

const { t } = useI18n();

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
const isLoadingReplies = ref(false);

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

    // Простое форматирование без использования плюрализации
    if (diffSec < 60) return t('comments.justNow');
    
    // Для русского языка используем функцию для правильного склонения
    const formatRussianTime = (count: number, one: string, few: string, many: string) => {
      // Правила склонения для русского языка
      const lastDigit = count % 10;
      const lastTwoDigits = count % 100;
      
      if (lastDigit === 1 && lastTwoDigits !== 11) {
        return `${count} ${one} назад`;
      } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
        return `${count} ${few} назад`;
      } else {
        return `${count} ${many} назад`;
      }
    };
    
    if (diffMin < 60) {
      if (diffMin === 1) return t('comments.minuteAgo');
      return formatRussianTime(diffMin, 'минуту', 'минуты', 'минут');
    }
    
    if (diffHour < 24) {
      if (diffHour === 1) return t('comments.hourAgo');
      return formatRussianTime(diffHour, 'час', 'часа', 'часов');
    }
    
    if (diffDay < 30) {
      if (diffDay === 1) return t('comments.dayAgo');
      return formatRussianTime(diffDay, 'день', 'дня', 'дней');
    }
    
    if (diffMonth < 12) {
      if (diffMonth === 1) return t('comments.monthAgo');
      return formatRussianTime(diffMonth, 'месяц', 'месяца', 'месяцев');
    }
    
    if (diffYear === 1) return t('comments.yearAgo');
    return formatRussianTime(diffYear, 'год', 'года', 'лет');
  } catch (error) {
    console.error('Error formatting date:', error);
    return t('comments.someTimeAgo');
  }
});

const hasReplies = computed(() => {
  console.log('Checking if comment has replies:', props.comment.id, 'repliesCount:', props.comment.repliesCount);
  // Ensure we handle undefined, null, or zero cases properly
  const count = props.comment.repliesCount;
  return count !== undefined && count !== null && count > 0;
});

const replyCount = computed(() => {
  return props.comment.repliesCount || 0;
});

const replies = computed(() => {
  if (!props.comment.id || !showReplies.value) return [];
  console.log('Getting replies for comment:', props.comment.id, commentStore.replies.value[props.comment.id]);
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
    const errorMessage = error instanceof Error ? error.message : t('comments.updateError');
    alert(`${t('common.error')}: ${errorMessage}. ${t('comments.tryAgain')}`);
  }
};

const toggleReplies = async () => {
  if (!hasReplies.value) return;
  
  showReplies.value = !showReplies.value;
  
  if (showReplies.value && (!commentStore.replies.value[props.comment.id] || commentStore.replies.value[props.comment.id].length === 0)) {
    try {
      isLoadingReplies.value = true;
      console.log('Loading replies for comment:', props.comment.id);
      await commentStore.fetchReplies(props.comment.videoId, props.comment.id);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      
      // Show an alert with a more user-friendly message
      alert(t('comments.loadRepliesError'));
      
      // Hide the replies section since we couldn't load them
      showReplies.value = false;
    } finally {
      isLoadingReplies.value = false;
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
    const errorMessage = error instanceof Error ? error.message : t('comments.deleteError');
    alert(`${t('common.error')}: ${errorMessage}. ${t('comments.tryAgain')}`);
  }
};

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token');
});

const isCurrentUser = computed(() => {
  try {
    if (!isAuthenticated.value) return false;
    
    // Use userStore instead of getMe directly
    const userId = userStore.user.value?.id;
    return userId === props.comment.userId;
  } catch (error) {
    console.error('Error checking if current user:', error);
    return false;
  }
});

const getCommentAvatarUrl = (user: { id?: string; username?: string } | null | undefined): string => {
  // First try to get the avatar from the API if user and id exist
  if (user && user.id) {
    return `/api/users/${user.id}/avatar`;
  }
  
  // If that's not possible, use the DiceBear fallback
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${user ? user.username : 'User'}`;
};

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement;
  if (target) {
    // If the avatar API fails, use DiceBear
    const username = props.comment.user ? props.comment.user.username : 'User';
    target.src = `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}`;
  }
};

const formatReplyCount = (count: number) => {
  // Правила склонения для русского языка
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `Показать ${count} ответ`;
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return `Показать ${count} ответа`;
  } else {
    return `Показать ${count} ответов`;
  }
};
</script>

<template>
  <div class="comment" :class="{ 'comment--reply': isReply }">
    <div class="comment__avatar">
      <img 
        :src="getCommentAvatarUrl(comment.user)"
        :alt="comment.user ? comment.user.username : t('comments.user')" 
        class="comment__avatar-img"
        @error="handleImageError"
      />
    </div>
    
    <div class="comment__content">
      <div class="comment__header">
        <span class="comment__username">{{ comment.user.username }}</span>
        <span class="comment__date">{{ formattedDate }}</span>
      </div>
      
      <div v-if="!isEditing" class="comment__text">
        <span>{{ comment.content }}</span>
      </div>
      
      <div v-else class="comment__edit-form">
        <textarea 
          v-model="editContent"
          class="comment__edit-textarea"
          :placeholder="t('comments.editYourComment')"
          rows="3"
        />
        
        <div class="comment__edit-actions">
          <button 
            class="comment__button comment__button--cancel"
            @click="cancelEditing"
          >
            {{ t('common.cancel') }}
          </button>
          <button 
            class="comment__button comment__button--save"
            :disabled="editContent.trim() === ''"
            @click="saveEdit"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </div>
      
      <div class="comment__actions">
        <button 
          v-if="isAuthenticated && !isReply"
          class="comment__action-button"
          @click="toggleReplyForm"
        >
          {{ t('comments.reply') }}
        </button>
        
        <button 
          v-if="isCurrentUser"
          class="comment__action-button"
          @click="handleEdit"
        >
          {{ t('comments.edit') }}
        </button>
        
        <button 
          v-if="isCurrentUser"
          class="comment__action-button comment__action-button--delete"
          @click="handleDelete"
        >
          {{ t('comments.delete') }}
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
          <span v-if="!showReplies">{{ formatReplyCount(replyCount) }}</span>
          <span v-else>{{ t('comments.hideReplies') }}</span>
        </button>
      </div>
      
      <div v-if="showReplies && !isReply" class="comment__replies">
        <div v-if="isLoadingReplies" class="comment__replies-loading">
          {{ t('comments.loadingReplies') }}
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
              <slot 
                name="reply-form" 
                :parent-id="reply.id" 
                :on-cancel="() => showReplies = false"
              />
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
  margin-left: 20px;
  padding-left: 20px;
  border-left: 2px solid var(--panel-bg, #E6F0FB);
}

.comment__avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 16px;
}

.comment__avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--panel-bg, #E6F0FB);
}

.comment__content {
  flex: 1;
  min-width: 0;
}

.comment__header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment__username {
  font-weight: 600;
  color: var(--text-primary, #1A2233);
  margin-right: 8px;
  text-decoration: none;
}

.comment__username:hover {
  color: var(--primary, #41A4FF);
  text-decoration: underline;
}

.comment__date {
  font-size: 12px;
  color: var(--text-secondary, #67748B);
}

.comment__text {
  margin-bottom: 12px;
  color: var(--text-primary, #1A2233);
  white-space: pre-wrap;
  word-break: break-word;
}

.comment__edit-form {
  margin-bottom: 12px;
}

.comment__edit-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--panel-bg, #E6F0FB);
  border-radius: 4px;
  font-family: 'Rubik', sans-serif;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 8px;
}

.comment__edit-textarea:focus {
  outline: none;
  border-color: var(--primary, #41A4FF);
}

.comment__edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.comment__button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
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

.comment__actions {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.comment__action-button {
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary, #67748B);
  cursor: pointer;
}

.comment__action-button:hover {
  color: var(--primary, #41A4FF);
}

.comment__action-button--delete:hover {
  color: var(--error, #FF677B);
}

.comment__reply-form {
  margin-top: 12px;
  margin-bottom: 12px;
}

.comment__replies-toggle {
  margin-bottom: 12px;
}

.comment__replies-button {
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--primary, #41A4FF);
  cursor: pointer;
}

.comment__replies-button:hover {
  text-decoration: underline;
}

.comment__replies {
  margin-top: 16px;
}

.comment__replies-loading {
  padding: 12px;
  font-size: 12px;
  color: var(--text-secondary, #67748B);
  background-color: var(--panel-bg, #E6F0FB);
  border-radius: 4px;
}

.comment__mention {
  color: var(--primary, #41A4FF);
  text-decoration: none;
  font-weight: 600;
}

.comment__mention:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .comment--reply {
    margin-left: 12px;
    padding-left: 12px;
  }
  
  .comment__avatar {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }
  
  .comment__username {
    font-size: 14px;
  }
  
  .comment__date {
    font-size: 10px;
  }
  
  .comment__text {
    font-size: 14px;
  }
  
  .comment__action-button {
    font-size: 10px;
  }
  
  .comment__replies-button {
    font-size: 10px;
  }
}
</style>