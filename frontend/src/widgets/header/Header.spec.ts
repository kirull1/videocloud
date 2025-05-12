import { test, expect } from '@playwright/test';
import { createUrlForComponent } from '@/utils/playwright-helpers';

const componentName = 'Widgets/Header';

test.describe('Header Component Screenshots', () => {
  test('Default on desktop', async ({ page }) => {
    await page.goto(createUrlForComponent(componentName, 'default'));
    await page.waitForSelector('.header');
    const screenshot = await page.screenshot();
    await expect(screenshot).toMatchSnapshot('header-default-desktop.png');
  });

  test('Default on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(createUrlForComponent(componentName, 'default'));
    await page.waitForSelector('.header');
    const screenshot = await page.screenshot();
    await expect(screenshot).toMatchSnapshot('header-default-mobile.png');
  });

  test('Logged in on desktop', async ({ page }) => {
    await page.goto(createUrlForComponent(componentName, 'logged-in'));
    await page.waitForSelector('.header');
    const screenshot = await page.screenshot();
    await expect(screenshot).toMatchSnapshot('header-logged-in-desktop.png');
  });

  test('Logged in on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(createUrlForComponent(componentName, 'logged-in'));
    await page.waitForSelector('.header');
    const screenshot = await page.screenshot();
    await expect(screenshot).toMatchSnapshot('header-logged-in-mobile.png');
  });

  test('Search loading on desktop', async ({ page }) => {
    await page.goto(createUrlForComponent(componentName, 'search-loading'));
    await page.waitForSelector('.header');
    const screenshot = await page.screenshot();
    await expect(screenshot).toMatchSnapshot('header-search-loading-desktop.png');
  });

  test('Search loading on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(createUrlForComponent(componentName, 'search-loading'));
    await page.waitForSelector('.header');
    const screenshot = await page.screenshot();
    await expect(screenshot).toMatchSnapshot('header-search-loading-mobile.png');
  });
});