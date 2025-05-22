import { ref, computed } from 'vue';
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from './types';
import { commentApi } from '../api/commentApi';

// State
const comments = ref<Comment[]>([]);
const replies = ref<Record<string, Comment[]>>({});
const isLoading = ref(false);
const error = ref<string | null>(null);

// Getters
const rootComments = computed(() => 
  comments.value.filter(comment => !comment.parentId)
);

// Actions
async function fetchComments(videoId: string) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const fetchedComments = await commentApi.getComments(videoId);
    comments.value = fetchedComments;
    
    return fetchedComments;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch comments';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function fetchReplies(videoId: string, parentId: string) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const fetchedReplies = await commentApi.getComments(videoId, parentId);
    replies.value[parentId] = fetchedReplies;
    
    return fetchedReplies;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch replies';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function createComment(data: CreateCommentRequest) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const newComment = await commentApi.createComment(data);
    
    // If it's a reply, add it to the replies list
    if (data.parentId) {
      if (!replies.value[data.parentId]) {
        replies.value[data.parentId] = [];
      }
      replies.value[data.parentId].unshift(newComment);
      
      // Update the parent comment's repliesCount
      const parentIndex = comments.value.findIndex(c => c.id === data.parentId);
      if (parentIndex !== -1) {
        comments.value[parentIndex].repliesCount += 1;
      }
    } else {
      // Add to main comments list
      comments.value.unshift(newComment);
    }
    
    return newComment;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create comment';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function updateComment(id: string, data: UpdateCommentRequest) {
  try {
    isLoading.value = true;
    error.value = null;
    
    const updatedComment = await commentApi.updateComment(id, data);
    
    // Update in main comments list
    const commentIndex = comments.value.findIndex(c => c.id === id);
    if (commentIndex !== -1) {
      comments.value[commentIndex] = updatedComment;
    }
    
    // Update in replies if it exists there
    Object.keys(replies.value).forEach(parentId => {
      const replyIndex = replies.value[parentId].findIndex(r => r.id === id);
      if (replyIndex !== -1) {
        replies.value[parentId][replyIndex] = updatedComment;
      }
    });
    
    return updatedComment;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update comment';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function deleteComment(id: string) {
  try {
    isLoading.value = true;
    error.value = null;
    
    await commentApi.deleteComment(id);
    
    // Find the comment to check if it's a reply
    const comment = comments.value.find(c => c.id === id);
    
    // Remove from main comments list
    comments.value = comments.value.filter(c => c.id !== id);
    
    // Remove from replies if it exists there
    Object.keys(replies.value).forEach(parentId => {
      replies.value[parentId] = replies.value[parentId].filter(r => r.id !== id);
    });
    
    // If it was a reply, update the parent's repliesCount
    if (comment && comment.parentId) {
      const parentIndex = comments.value.findIndex(c => c.id === comment.parentId);
      if (parentIndex !== -1 && comments.value[parentIndex].repliesCount > 0) {
        comments.value[parentIndex].repliesCount -= 1;
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete comment';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

function reset() {
  comments.value = [];
  replies.value = {};
  isLoading.value = false;
  error.value = null;
}

// Export the store
export const commentStore = {
  // State
  comments: computed(() => comments.value),
  replies,
  isLoading: computed(() => isLoading.value),
  error: computed(() => error.value),
  
  // Getters
  rootComments,
  
  // Actions
  fetchComments,
  fetchReplies,
  createComment,
  updateComment,
  deleteComment,
  reset,
};