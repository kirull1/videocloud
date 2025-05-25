import type { Comment, CreateCommentRequest, UpdateCommentRequest } from '../model/types';

import { appConfig } from '@/shared/config/app.config';

const API_URL = `${appConfig.apiUrl}/comments`;

export const commentApi = {
  async getComments(videoId: string, parentId?: string): Promise<Comment[]> {
    let url = `${API_URL}?videoId=${videoId}`;
    
    if (parentId) {
      url += `&parentId=${parentId}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch comments');
    }

    return response.json();
  },

  async getComment(id: string): Promise<Comment> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch comment');
    }

    return response.json();
  },

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create comment');
    }

    return response.json();
  },

  async updateComment(id: string, data: UpdateCommentRequest): Promise<Comment> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update comment');
    }

    return response.json();
  },

  async deleteComment(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete comment');
    }
  },
};