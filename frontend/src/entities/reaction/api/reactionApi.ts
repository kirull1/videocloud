import { appConfig } from '@/shared/config/app.config';
import type { CreateReactionRequest, Reaction, VideoReactions } from '../model/types';

const API_URL = appConfig.apiUrl;

export const reactionApi = {
  async createReaction(reaction: CreateReactionRequest): Promise<Reaction> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reaction),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create reaction');
    }

    return response.json();
  },

  async deleteReaction(videoId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/reactions/${videoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete reaction');
    }
  },

  async getVideoReactions(videoId: string): Promise<VideoReactions> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/reactions/videos/${videoId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get video reactions');
    }

    return response.json();
  },

  async getUserReactions(): Promise<Reaction[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/reactions/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user reactions');
    }

    return response.json();
  },
};