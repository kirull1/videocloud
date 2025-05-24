import { authApi } from '@/features/auth/api/authApi';

/**
 * Handles API responses and checks for authentication errors
 * @param response The fetch response object
 * @returns The response if it's ok, otherwise throws an error
 */
export async function handleApiResponse(response: Response): Promise<any> {
  // If the response is ok, return the JSON data
  if (response.ok) {
    return response.json();
  }

  // If the response status is 401 Unauthorized, the token is invalid
  if (response.status === 401) {
    console.log('Authentication error, logging out user');
    // Log out the user
    await authApi.logout();
    // Redirect to login page
    window.location.href = '/auth/login';
    throw new Error('Authentication error, please log in again');
  }

  // For other errors, try to parse the error message from the response
  try {
    const error = await response.json();
    throw new Error(error.message || `API error: ${response.status}`);
  } catch (e) {
    // If parsing fails, throw a generic error with the status code
    throw new Error(`API error: ${response.status}`);
  }
}

/**
 * Makes an authenticated API request
 * @param url The URL to fetch
 * @param options The fetch options
 * @returns The response data
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<any> {
  const token = authApi.getToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  // Add the authorization header to the options
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  };
  
  // Make the request
  const response = await fetch(url, authOptions);
  
  // Handle the response
  return handleApiResponse(response);
}