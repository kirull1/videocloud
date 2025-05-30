import { authApi } from '@/features/auth/api/authApi';

/**
 * Handles API response and automatically handles authentication errors
 * @param response - Fetch response object
 */
export const handleApiResponse = async (response: Response): Promise<Response> => {
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
  
  return response;
};

/**
 * Authenticated fetch function that adds authorization header
 * @param url - Request URL
 * @param options - Fetch options
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return handleApiResponse(response);
};