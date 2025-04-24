import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the URL to the Storybook instance with our Text component
const storybookUrl = 'http://localhost:6006';

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '__screenshots__');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Define the viewport sizes for testing
const viewports = {
  mobile: { width: 375, height: 667 },
  desktop: { width: 1280, height: 800 }
};

// Define the variants of the Text component to test
const variants = [
  'default',
  'small',
  'large',
  'bold',
  'primary',
  'secondary',
  'error'
];

test.describe('Text Component Screenshots', () => {
  // Before all tests, check if Storybook is available
  test.beforeAll(async ({ browser }) => {
    console.log('Checking if Storybook is running...');
    const page = await browser.newPage();
    try {
      // Try to connect to Storybook with a longer timeout
      await page.goto(storybookUrl, { timeout: 90000 });
      console.log('Successfully connected to Storybook');
    } catch (e) {
      console.error('ERROR: Make sure Storybook is running on port 6006');
      console.error('Run "pnpm run storybook" in another terminal before running the tests');
      throw new Error('Storybook is not running. Please start it with "pnpm run storybook"');
    } finally {
      await page.close();
    }
  });

  // Test each variant in each viewport
  for (const viewport of Object.entries(viewports)) {
    const [viewportName, viewportSize] = viewport;

    for (const variant of variants) {
      test(`Text component - ${variant} variant - ${viewportName} view`, async ({ page }) => {
        // Set the viewport size
        await page.setViewportSize(viewportSize);

        // Construct the URL for the specific story
        const storyUrl = `${storybookUrl}/iframe.html?id=shared-ui-text--${variant.toLowerCase()}&viewMode=story`;
        console.log(`Navigating to: ${storyUrl}`);
        
        // Navigate to the specific story
        await page.goto(storyUrl, { waitUntil: 'networkidle' });
        
        // Wait for the component to be visible with a longer timeout
        await page.waitForSelector('.text', { timeout: 30000 });
        
        // Wait a bit to ensure styles are applied
        await page.waitForTimeout(1000);

        // Take a screenshot and save it in the __screenshots__ directory
        const screenshotPath = path.join(screenshotsDir, `text-${variant.toLowerCase()}-${viewportName}.png`);
        console.log(`Taking screenshot: ${screenshotPath}`);
        
        await page.screenshot({
          path: screenshotPath,
          fullPage: false,
          timeout: 30000
        });

        // Verify the screenshot file exists
        expect(fs.existsSync(screenshotPath)).toBeTruthy();
      });
    }
  }
});