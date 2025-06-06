import { appConfig } from '@/shared/config/app.config';
import { authenticatedFetch, handleApiResponse } from '@/shared/lib/apiUtils';

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

interface RequestPasswordResetRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
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
    return authenticatedFetch<ProfileResponse>(`${API_URL}/profile`, {
      method: 'GET',
    });
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    return authenticatedFetch<ProfileResponse>(`${API_URL}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
    return authenticatedFetch<MessageResponse>(`${API_URL}/password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async uploadAvatar(file: File): Promise<AvatarResponse> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // Create a new FormData instance
    const formData = new FormData();
    
    // Append the file with its original name
    formData.append('avatar', file, file.name);
    
    console.log('Uploading avatar to:', `${API_URL}/avatar`);
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size + ' bytes'
    });
    
    try {
      // Use authenticatedFetch but don't set Content-Type header
      return authenticatedFetch<AvatarResponse>(`${API_URL}/avatar`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  },

  async requestEmailVerification(): Promise<MessageResponse> {
    return authenticatedFetch<MessageResponse>(`${API_URL}/verify-email`, {
      method: 'POST',
    });
  },

  async verifyEmail(verificationToken: string): Promise<MessageResponse> {
    return fetch(`${API_URL}/verify-email/${verificationToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: verificationToken }),
    }).then(response => handleApiResponse<MessageResponse>(response));
  },

  async requestPasswordReset(data: RequestPasswordResetRequest): Promise<MessageResponse> {
    try {
      console.log('Sending password reset request:', data);
      
      return fetch(`${API_URL}/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(response => handleApiResponse<MessageResponse>(response));
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    try {
      console.log('Sending password reset:', data);
      
      return fetch(`${API_URL}/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(response => handleApiResponse<MessageResponse>(response));
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
};