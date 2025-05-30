import { appConfig } from '@/shared/config/app.config';
import type {
  Channel,
  CreateChannelRequest,
  UpdateChannelRequest,
  ChannelAnalytics,
} from '../model/types';

// Use the API URL from environment variable or config
const API_URL = import.meta.env.VITE_API_URL || appConfig.apiUrl || '/api';

console.log('Channel API initialized with API_URL:', API_URL);

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
    console.log(`Fetching all channels from ${API_URL}/channels`);
    const response = await fetch(`${API_URL}/channels`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch channels');
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} channels successfully`);
    return data;
  },

  async getChannel(id: string): Promise<Channel> {
    console.log(`ChannelAPI: Fetching channel with ID: ${id} from ${API_URL}/channels/${id}`);
    
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/channels/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ChannelAPI: Error fetching channel:`, { status: response.status, body: errorText });
        throw new Error(`Failed to fetch channel: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log(`ChannelAPI: Channel data received:`, data);
      return data;
    } catch (error) {
      console.error(`ChannelAPI: Exception fetching channel:`, error);
      throw error;
    }
  },

  async getChannelByCustomUrl(customUrl: string): Promise<Channel> {
    console.log(`Fetching channel with custom URL: ${customUrl} from ${API_URL}/channels/custom/${customUrl}`);
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

    console.log(`Fetching my channel from ${API_URL}/channels/me`);
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