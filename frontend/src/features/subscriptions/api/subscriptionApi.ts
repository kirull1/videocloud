import { appConfig } from '@/shared/lib/appConfig';
import { authenticatedFetch } from '@/shared/lib/apiUtils';

const API_URL = appConfig.apiUrl;

export const subscriptionApi = {
  /**
   * Subscribe to a channel
   * @param channelId - The channel ID to subscribe to
   * @returns Promise with success status and message
   */
  async subscribeToChannel(channelId: string): Promise<{ success: boolean; message: string }> {
    const response = await authenticatedFetch(`${API_URL}/subscriptions/${channelId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to subscribe to channel');
    }

    return response.json();
  },

  /**
   * Unsubscribe from a channel
   * @param channelId - The channel ID to unsubscribe from
   * @returns Promise with success status and message
   */
  async unsubscribeFromChannel(channelId: string): Promise<{ success: boolean; message: string }> {
    const response = await authenticatedFetch(`${API_URL}/subscriptions/${channelId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unsubscribe from channel');
    }

    return response.json();
  },

  /**
   * Check if the current user is subscribed to a channel
   * @param channelId - The channel ID to check subscription status for
   * @returns Promise with subscription status
   */
  async checkSubscriptionStatus(channelId: string): Promise<{ isSubscribed: boolean }> {
    const response = await authenticatedFetch(`${API_URL}/subscriptions/${channelId}/status`);

    if (!response.ok) {
      // If the user is not authenticated, they are not subscribed
      if (response.status === 401) {
        return { isSubscribed: false };
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to check subscription status');
    }

    return response.json();
  },

  /**
   * Get the number of subscribers for a channel
   * @param channelId - The channel ID to get subscriber count for
   * @returns Promise with subscriber count
   */
  async getSubscriberCount(channelId: string): Promise<number> {
    const response = await fetch(`${API_URL}/subscriptions/${channelId}/count`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscriber count');
    }

    const data = await response.json();
    return data.count;
  },

  /**
   * Get list of channels the current user is subscribed to
   * @returns Promise with list of subscribed channels
   */
  async getSubscribedChannels(): Promise<{ items: any[] }> {
    const response = await authenticatedFetch(`${API_URL}/subscriptions/user/list`);

    if (!response.ok) {
      // If the user is not authenticated, return empty list
      if (response.status === 401) {
        return { items: [] };
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscribed channels');
    }

    return response.json();
  }
}; 