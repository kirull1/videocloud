import { test, expect } from '@playwright/test';
import { createUrlForComponent } from '@/utils/playwright-helpers';

const componentName = 'Shared/Logo';

test.describe('Logo Component Screenshots', () => {
  test('Default on desktop', async ({ page }) => {
    // Go to the Storybook URL for this story
    await page.goto(createUrlForComponent(componentName, 'default'));
    
    // Wait for the logo to load
    await page.waitForSelector('.logo');
    
    // Take screenshot
    const screenshot = await page.screenshot();
    
    // Compare with baseline
    await expect(screenshot).toMatchSnapshot('logo-default-desktop.png');
  });

  test('Default on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to the Storybook URL for this story
    await page.goto(createUrlForComponent(componentName, 'default'));
    
    // Wait for the logo to load
    await page.waitForSelector('.logo');
    
    // Take screenshot
    const screenshot = await page.screenshot();
    
    // Compare with baseline
    await expect(screenshot).toMatchSnapshot('logo-default-mobile.png');
  });

  test('White on desktop', async ({ page }) => {
    // Go to the Storybook URL for this story
    await page.goto(createUrlForComponent(componentName, 'white'));
    
    // Wait for the logo to load
    await page.waitForSelector('.logo');
    
    // Take screenshot
    const screenshot = await page.screenshot();
    
    // Compare with baseline
    await expect(screenshot).toMatchSnapshot('logo-white-desktop.png');
  });

  test('White on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to the Storybook URL for this story
    await page.goto(createUrlForComponent(componentName, 'white'));
    
    // Wait for the logo to load
    await page.waitForSelector('.logo');
    
    // Take screenshot
    const screenshot = await page.screenshot();
    
    // Compare with baseline
    await expect(screenshot).toMatchSnapshot('logo-white-mobile.png');
  });
});