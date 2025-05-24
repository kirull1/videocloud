/**
 * Generates an avatar URL based on username using DiceBear API
 * @param username - The username to generate avatar for
 * @param size - The size of the avatar in pixels (default: 32)
 * @returns URL to the generated avatar
 */
export const generateAvatarUrl = (username: string, size = 32): string => {
  // Use DiceBear's initials style for consistent, professional avatars
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username)}&size=${size}`;
};

/**
 * Checks if a URL is an S3 URL
 * @param url - The URL to check
 * @returns true if the URL is an S3 URL
 */
export const isS3Url = (url: string): boolean => {
  return url.includes('storage.yandexcloud.net');
};

/**
 * Gets the appropriate avatar URL based on the source
 * @param avatarUrl - The avatar URL from the API
 * @param username - The username to use as fallback
 * @param size - The size of the avatar in pixels (default: 32)
 * @returns The appropriate avatar URL
 */
export const getAvatarUrl = (
  avatarUrl: string | undefined,
  username: string,
  size = 32
): string => {
  // If no avatar URL is provided, generate one based on username
  if (!avatarUrl) {
    return generateAvatarUrl(username, size);
  }

  // If it's an S3 URL, use it directly
  if (isS3Url(avatarUrl)) {
    return avatarUrl;
  }

  // For other URLs, use them as is
  return avatarUrl;
};