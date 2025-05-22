import { appConfig } from '@/shared/config/app.config';
import type {
  Channel,
  CreateChannelRequest,
  UpdateChannelRequest,
  ChannelAnalytics,
} from '../model/types';

const API_URL = appConfig.apiUrl;

export const channelApi = {
  async createChannel(channelData: CreateChannelRequest): Promise<Channel> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(channelData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create channel');
    }

    return response.json();
  },

  async getChannels(): Promise<Channel[]> {
    const response = await fetch(`${API_URL}/channels`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch channels');
    }

    return response.json();
  },

  async getChannel(id: string): Promise<Channel> {
    const response = await fetch(`${API_URL}/channels/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch channel');
    }

    return response.json();
  },

  async getChannelByCustomUrl(customUrl: string): Promise<Channel> {
    const response = await fetch(`${API_URL}/channels/custom/${customUrl}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch channel');
    }

    return response.json();
  },

  async getMyChannel(): Promise<Channel> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/channels/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch your channel');
    }

    return response.json();
  },

  async updateChannel(id: string, channelData: UpdateChannelRequest): Promise<Channel> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/channels/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(channelData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update channel');
    }

    return response.json();
  },

  async uploadBanner(id: string, file: File): Promise<Channel> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('banner', file);

    const response = await fetch(`${API_URL}/channels/${id}/banner`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload banner');
    }

    return response.json();
  },

  async getChannelAnalytics(id: string): Promise<ChannelAnalytics> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/channels/${id}/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch channel analytics');
    }

    return response.json();
  },

  async deleteChannel(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/channels/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete channel');
    }
  },
};