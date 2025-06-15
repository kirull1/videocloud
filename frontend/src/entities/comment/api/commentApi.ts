import type { Comment, CreateCommentRequest, UpdateCommentRequest } from '../model/types';
import { appConfig } from '@/shared/config/app.config';
import { authenticatedFetch } from '@/shared/lib/apiUtils';

const API_URL = `${appConfig.apiUrl}/comments`;

export const commentApi = {
  async getComments(videoId: string, parentId?: string): Promise<Comment[]> {
    let url = `${API_URL}?videoId=${videoId}`;
    
    if (parentId) {
      url += `&parentId=${parentId}`;
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch comments' }));
        throw new Error(error.message || 'Failed to fetch comments');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async getComment(id: string): Promise<Comment> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch comment' }));
      throw new Error(error.message || 'Failed to fetch comment');
    }

    return response.json();
  },

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    try {
      console.log('Creating comment with data:', data);
      return await authenticatedFetch<Comment>(`${API_URL}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  async updateComment(id: string, data: UpdateCommentRequest): Promise<Comment> {
    try {
      return await authenticatedFetch<Comment>(`${API_URL}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  async deleteComment(id: string): Promise<void> {
    try {
      await authenticatedFetch<void>(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};