/**
 * Create a URL for a Storybook component
 * @param componentName The component path in Storybook (e.g., 'Shared/Text')
 * @param storyName The story name in lowercase (e.g., 'default', 'primary', etc.)
 * @returns The full URL to the story
 */
export function createUrlForComponent(componentName: string, storyName: string): string {
  // Convert spaces to dashes and make lowercase for the URL
  const formattedComponentName = componentName.replace(/\s+/g, '-').toLowerCase();
  const formattedStoryName = storyName.toLowerCase();
  
  // Return the Storybook iframe URL
  return `http://localhost:6006/iframe.html?id=${formattedComponentName}--${formattedStoryName}&viewMode=story`;
}