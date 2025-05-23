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
      // Make the request with the correct headers
      // Important: Do NOT set Content-Type header when using FormData
      const response = await fetch(`${API_URL}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Let the browser set the Content-Type header with boundary
        },
        body: formData,
      });
  
      // Handle non-OK responses
      if (!response.ok) {
        // Try to get response as text first
        const errorText = await response.text();
        console.error('Avatar upload failed:', response.status, errorText);
        
        // Try to parse as JSON if possible
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.message || 'Failed to upload avatar');
        } catch (e) {
          // If parsing fails, use the raw text
          throw new Error(`Failed to upload avatar: ${response.status} ${errorText}`);
        }
      }
  
      // Parse successful response
      const result = await response.json();
      console.log('Avatar upload successful:', result);
      return result;
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

  async requestPasswordReset(data: RequestPasswordResetRequest): Promise<MessageResponse> {
    try {
      console.log('Sending password reset request:', data);
      
      const response = await fetch(`${API_URL}/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Try to get response as text first
        const errorText = await response.text();
        console.error('Password reset request failed:', response.status, errorText);
        
        // Try to parse as JSON if possible
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.message || 'Failed to request password reset');
        } catch (e) {
          // If parsing fails, use the raw text
          throw new Error(`Failed to request password reset: ${response.status} ${errorText}`);
        }
      }

      return response.json();
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    try {
      console.log('Sending password reset:', data);
      
      const response = await fetch(`${API_URL}/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Try to get response as text first
        const errorText = await response.text();
        console.error('Password reset failed:', response.status, errorText);
        
        // Try to parse as JSON if possible
        try {
          const error = JSON.parse(errorText);
          throw new Error(error.message || 'Failed to reset password');
        } catch (e) {
          // If parsing fails, use the raw text
          throw new Error(`Failed to reset password: ${response.status} ${errorText}`);
        }
      }

      return response.json();
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  },
};