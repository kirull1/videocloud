import { describe, it, expect } from 'vitest'
import { generateAvatarUrl } from './avatar'

describe('Avatar Utility', () => {
  it('should generate a valid avatar URL with default size', () => {
    const username = 'testuser'
    const url = generateAvatarUrl(username)
    
    // Check that the URL is properly formatted
    expect(url).toContain('https://api.dicebear.com/7.x/initials/svg')
    expect(url).toContain(`seed=${encodeURIComponent(username)}`)
    expect(url).toContain('size=32') // Default size
  })

  it('should generate a valid avatar URL with custom size', () => {
    const username = 'testuser'
    const size = 64
    const url = generateAvatarUrl(username, size)
    
    // Check that the URL is properly formatted
    expect(url).toContain('https://api.dicebear.com/7.x/initials/svg')
    expect(url).toContain(`seed=${encodeURIComponent(username)}`)
    expect(url).toContain(`size=${size}`)
  })

  it('should properly encode usernames with special characters', () => {
    const username = 'test user@example.com'
    const url = generateAvatarUrl(username)
    
    // Check that the username is properly encoded
    expect(url).toContain(`seed=${encodeURIComponent(username)}`)
    expect(url).not.toContain('test user@example.com')
  })

  it('should handle empty usernames', () => {
    const username = ''
    const url = generateAvatarUrl(username)
    
    // Check that the URL is still valid
    expect(url).toContain('https://api.dicebear.com/7.x/initials/svg')
    expect(url).toContain(`seed=${encodeURIComponent(username)}`)
  })

  it('should generate different URLs for different usernames', () => {
    const username1 = 'user1'
    const username2 = 'user2'
    
    const url1 = generateAvatarUrl(username1)
    const url2 = generateAvatarUrl(username2)
    
    // Check that the URLs are different
    expect(url1).not.toEqual(url2)
  })

  it('should generate the same URL for the same username', () => {
    const username = 'testuser'
    
    const url1 = generateAvatarUrl(username)
    const url2 = generateAvatarUrl(username)
    
    // Check that the URLs are the same
    expect(url1).toEqual(url2)
  })
})