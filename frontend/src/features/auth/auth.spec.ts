import { test, expect } from '@playwright/test'

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  username: `testuser-${Date.now()}`,
  password: 'Password123!',
}

test.describe('Authentication Flow', () => {
  test('should allow user to register, login, and access profile', async ({ page }) => {
    // Step 1: Visit the registration page
    await page.goto('/auth/register')
    await expect(page).toHaveTitle(/VideoCloud/)
    
    // Step 2: Fill out the registration form
    await page.fill('#email', testUser.email)
    await page.fill('#username', testUser.username)
    await page.fill('#password', testUser.password)
    await page.fill('#confirmPassword', testUser.password)
    
    // Step 3: Submit the form
    await page.click('button[type="submit"]')
    
    // Step 4: Wait for navigation to home page after successful registration
    await page.waitForURL('/')
    
    // Step 5: Verify user is logged in by checking for avatar in header
    await expect(page.locator('.avatar')).toBeVisible()
    
    // Step 6: Click on the avatar to open user menu
    await page.click('.avatar')
    
    // Step 7: Click on Profile link in the menu
    await page.click('text=Profile')
    
    // Step 8: Wait for navigation to profile page
    await page.waitForURL('/profile')
    
    // Step 9: Verify profile page shows correct username
    await expect(page.locator('.profile-details')).toContainText(testUser.username)
    
    // Step 10: Logout
    await page.click('.avatar')
    await page.click('text=Logout')
    
    // Step 11: Verify user is logged out and redirected to login page
    await page.waitForURL('/auth/login')
    
    // Step 12: Login with the registered user
    await page.fill('#emailOrUsername', testUser.username)
    await page.fill('#password', testUser.password)
    await page.click('button[type="submit"]')
    
    // Step 13: Wait for navigation to home page after successful login
    await page.waitForURL('/')
    
    // Step 14: Verify user is logged in again
    await expect(page.locator('.avatar')).toBeVisible()
  })
  
  test('should show error message for invalid login', async ({ page }) => {
    // Step 1: Visit the login page
    await page.goto('/auth/login')
    
    // Step 2: Fill out the login form with invalid credentials
    await page.fill('#emailOrUsername', 'nonexistent-user')
    await page.fill('#password', 'wrong-password')
    
    // Step 3: Submit the form
    await page.click('button[type="submit"]')
    
    // Step 4: Verify error message is displayed
    await expect(page.locator('.form-error')).toBeVisible()
    await expect(page.locator('.form-error')).toContainText('Invalid credentials')
  })
  
  test('should validate registration form', async ({ page }) => {
    // Step 1: Visit the registration page
    await page.goto('/auth/register')
    
    // Step 2: Submit empty form
    await page.click('button[type="submit"]')
    
    // Step 3: Verify validation errors are displayed
    await expect(page.locator('.error-message')).toHaveCount(4) // Email, username, password, confirmPassword
    
    // Step 4: Fill email only
    await page.fill('#email', 'test@example.com')
    
    // Step 5: Submit form again
    await page.click('button[type="submit"]')
    
    // Step 6: Verify validation errors are still displayed for other fields
    await expect(page.locator('.error-message')).toHaveCount(3) // username, password, confirmPassword
  })
  
  test('should redirect to login page when accessing protected route while logged out', async ({ page }) => {
    // Step 1: Try to visit the profile page while logged out
    await page.goto('/profile')
    
    // Step 2: Verify redirection to login page
    await page.waitForURL('/auth/login')
    
    // Step 3: Verify the redirect query parameter is set
    expect(page.url()).toContain('redirect=%2Fprofile')
  })
})