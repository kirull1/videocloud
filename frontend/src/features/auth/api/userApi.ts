import { appConfig } from '@/shared/config/app.config';

interface ProfileResponse {
  id: string;
  email: string;
  username: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileRequest {
  email?: string;
  username?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface MessageResponse {
  message: string;
}

interface AvatarResponse {
  avatarUrl: string;
}

const API_URL = `${appConfig.apiUrl}/users`;

export const userApi = {
  async getProfile(): Promise<ProfileResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get profile');
    }

    return response.json();
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  },

  async changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_URL}/password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return response.json();
  },

  async uploadAvatar(file: File): Promise<AvatarResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    console.log('Uploading avatar to:', `${API_URL}/avatar`);
    console.log('Token:', token.substring(0, 10) + '...');
    
    try {
      const response = await fetch(`${API_URL}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Avatar upload failed:', response.status, errorText);
        
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.message || 'Failed to upload avatar');
        } catch (e) {
          throw new Error(`Failed to upload avatar: ${response.status} ${errorText}`);
        }
      }
  
      return response.json();
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  },

  async requestEmailVerification(): Promise<MessageResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to request email verification');
    }

    return response.json();
  },

  async verifyEmail(verificationToken: string): Promise<MessageResponse> {
    const response = await fetch(`${API_URL}/verify-email/${verificationToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: verificationToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify email');
    }

    return response.json();
  },
};