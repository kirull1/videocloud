interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
}

const API_URL = '/api/auth';

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign in');
    }

    return response.json();
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create account');
    }

    return response.json();
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    // Clear any auth-related cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async checkAuthValidity(): Promise<boolean> {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    try {
      // Make a request to the users/profile endpoint to validate the token
      // If the token is invalid, this request will fail with a 401 Unauthorized error
      const response = await fetch(`/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      // If the response is not ok, the token is invalid
      if (!response.ok) {
        console.log('Token validation failed:', response.status);
        // Token is invalid, log out the user
        await this.logout();
        return false;
      }
      
      // Make sure we can parse the response as JSON
      try {
        await response.json();
        return true;
      } catch (parseError) {
        console.error('Error parsing profile response:', parseError);
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('Error validating token:', error);
      // In case of an error, assume the token is invalid
      await this.logout();
      return false;
    }
  },
}; 