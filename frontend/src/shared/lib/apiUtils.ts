import { authApi } from '@/features/auth/api/authApi';

/**
 * Handles API response and automatically handles authentication errors
 * @param response - Fetch response object
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 401) {
    // Clear auth token and redirect to login
    localStorage.removeItem('token');
    
    // Clear cookies related to authentication
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login
    window.location.href = '/auth/login';
    throw new Error('Authentication required');
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `API Error: ${response.status} ${response.statusText}`);
    } catch (e) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  }
  
  return response.json();
};

/**
 * Authenticated fetch function that adds authorization header
 * @param url - Request URL
 * @param options - Fetch options
 */
export const authenticatedFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  
  // Only set Content-Type if not a FormData request
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    return handleApiResponse<T>(response);
  } catch (error) {
    console.error(`Network error when fetching ${url}:`, error);
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};