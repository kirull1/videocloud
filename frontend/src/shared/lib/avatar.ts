/**
 * Generates an avatar URL based on username using DiceBear API
 * @param username - The username to generate avatar for
 * @param size - The size of the avatar in pixels (default: 32)
 * @returns URL to the generated avatar
 */
export const generateAvatarUrl = (username: string, size = 32): string => {
  // Use DiceBear's initials style for consistent, professional avatars
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}&size=${size}`;
}; 