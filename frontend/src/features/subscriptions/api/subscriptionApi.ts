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
    try {
      return await authenticatedFetch<{ success: boolean; message: string }>(`${API_URL}/subscriptions/${channelId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      throw error;
    }
  },

  /**
   * Unsubscribe from a channel
   * @param channelId - The channel ID to unsubscribe from
   * @returns Promise with success status and message
   */
  async unsubscribeFromChannel(channelId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await authenticatedFetch<{ success: boolean; message: string }>(`${API_URL}/subscriptions/${channelId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
      throw error;
    }
  },

  /**
   * Check if the current user is subscribed to a channel
   * @param channelId - The channel ID to check subscription status for
   * @returns Promise with subscription status
   */
  async checkSubscriptionStatus(channelId: string): Promise<{ isSubscribed: boolean }> {
    try {
      return await authenticatedFetch<{ isSubscribed: boolean }>(`${API_URL}/subscriptions/${channelId}/status`);
    } catch (error) {
      // If the user is not authenticated, they are not subscribed
      if (error instanceof Error && error.message.includes('401')) {
        return { isSubscribed: false };
      }
      console.error('Error checking subscription status:', error);
      throw error;
    }
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
    try {
      return await authenticatedFetch<{ items: any[] }>(`${API_URL}/subscriptions/user/list`);
    } catch (error) {
      // If the user is not authenticated, return empty list
      if (error instanceof Error && error.message.includes('401')) {
        return { items: [] };
      }
      console.error('Error getting subscribed channels:', error);
      throw error;
    }
  }
}; 