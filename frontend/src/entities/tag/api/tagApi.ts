import type { Tag } from '../model/types';

const API_URL = '/api/tags';

export const tagApi = {
  async getTags(): Promise<Tag[]> {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tags');
    }

    return response.json();
  },

  async getTag(id: string): Promise<Tag> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tag');
    }

    return response.json();
  },

  async getTagBySlug(slug: string): Promise<Tag> {
    const response = await fetch(`${API_URL}/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tag');
    }

    return response.json();
  },
};