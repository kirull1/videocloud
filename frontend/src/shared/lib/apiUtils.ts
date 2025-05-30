import { authApi } from '@/features/auth/api/authApi';

/**
 * Handle API response and return data or throw error
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Try to parse the error response as JSON
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error ${response.status}`);
    } catch (e) {
      // If parsing fails, throw a generic error with the status
      throw new Error(`HTTP error ${response.status}`);
    }
  }
  
  return response.json() as Promise<T>;
}

/**
 * Perform an authenticated fetch request
 */
export async function authenticatedFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  // Add authorization header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  return handleApiResponse<T>(response);
}