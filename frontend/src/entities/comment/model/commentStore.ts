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
    
    console.log('Fetching comments for video:', videoId);
    const fetchedComments = await commentApi.getComments(videoId);
    console.log('Fetched comments:', fetchedComments);
    comments.value = fetchedComments;
    
    return fetchedComments;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch comments';
    console.error('Error in fetchComments:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function fetchReplies(videoId: string, parentId: string) {
  try {
    isLoading.value = true;
    error.value = null;
    
    console.log('Fetching replies for parent:', parentId, 'in video:', videoId);
    const fetchedReplies = await commentApi.getComments(videoId, parentId);
    console.log('Fetched replies:', fetchedReplies);
    replies.value[parentId] = fetchedReplies;
    
    return fetchedReplies;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch replies';
    console.error('Error in fetchReplies:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function createComment(data: CreateCommentRequest) {
  try {
    isLoading.value = true;
    error.value = null;
    
    console.log('Creating comment with data:', data);
    const newComment = await commentApi.createComment(data);
    console.log('Created comment:', newComment);
    
    // If it's a reply, add it to the replies list
    if (data.parentId) {
      console.log('This is a reply to comment:', data.parentId);
      if (!replies.value[data.parentId]) {
        replies.value[data.parentId] = [];
      }
      replies.value[data.parentId].unshift(newComment);
      
      // Update the parent comment's repliesCount if it exists
      const parentIndex = comments.value.findIndex(c => c.id === data.parentId);
      if (parentIndex !== -1) {
        console.log('Found parent comment at index:', parentIndex);
        // Initialize repliesCount if it doesn't exist or is null
        if (comments.value[parentIndex].repliesCount === undefined || comments.value[parentIndex].repliesCount === null) {
          comments.value[parentIndex].repliesCount = 0;
        }
        comments.value[parentIndex].repliesCount += 1;
        console.log('Updated parent repliesCount to:', comments.value[parentIndex].repliesCount);
      } else {
        console.log('Parent comment not found in main comments list');
      }
    } else {
      // Add to main comments list
      console.log('This is a root comment, adding to main list');
      comments.value.unshift(newComment);
    }
    
    return newComment;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create comment';
    console.error('Error in createComment:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function updateComment(id: string, data: UpdateCommentRequest) {
  try {
    isLoading.value = true;
    error.value = null;
    
    console.log('Updating comment:', id, 'with data:', data);
    const updatedComment = await commentApi.updateComment(id, data);
    console.log('Updated comment:', updatedComment);
    
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
    console.error('Error in updateComment:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
}

async function deleteComment(id: string) {
  try {
    isLoading.value = true;
    error.value = null;
    
    console.log('Deleting comment:', id);
    
    // Find the comment to check if it's a reply
    const comment = comments.value.find(c => c.id === id);
    console.log('Comment to delete:', comment);
    
    await commentApi.deleteComment(id);
    
    // Remove from main comments list
    comments.value = comments.value.filter(c => c.id !== id);
    
    // Remove from replies if it exists there
    Object.keys(replies.value).forEach(parentId => {
      replies.value[parentId] = replies.value[parentId].filter(r => r.id !== id);
    });
    
    // If it was a reply, update the parent's repliesCount
    if (comment && comment.parentId) {
      console.log('This was a reply to:', comment.parentId);
      const parentIndex = comments.value.findIndex(c => c.id === comment.parentId);
      if (parentIndex !== -1) {
        console.log('Found parent comment at index:', parentIndex);
        // Initialize repliesCount if it doesn't exist or is null
        if (comments.value[parentIndex].repliesCount === undefined || comments.value[parentIndex].repliesCount === null) {
          comments.value[parentIndex].repliesCount = 0;
        } else if (comments.value[parentIndex].repliesCount > 0) {
          comments.value[parentIndex].repliesCount -= 1;
          console.log('Updated parent repliesCount to:', comments.value[parentIndex].repliesCount);
        }
      } else {
        console.log('Parent comment not found in main comments list');
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete comment';
    console.error('Error in deleteComment:', err);
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