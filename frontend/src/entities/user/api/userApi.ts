import { appConfig } from '@/shared/config/app.config';
import { handleApiResponse } from '@/shared/lib/apiUtils';

interface UserResponse {
  id: string;
  username: string;
  avatarUrl?: string;
}

const API_URL = `${appConfig.apiUrl}/users`;

export const userApi = {
  async getUserById(userId: string): Promise<UserResponse> {
    try {
      console.log(`Fetching user with ID: ${userId} from ${API_URL}/${userId}`);
      const response = await fetch(`${API_URL}/${userId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching user: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`User data fetched successfully:`, data);
      return data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  },

  async getUserAvatar(userId: string): Promise<string> {
    return `${API_URL}/${userId}/avatar`;
  }
}; 