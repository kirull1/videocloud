import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storybookUrl = 'http://localhost:6006';


const screenshotsDir = path.join(__dirname, '__screenshots__');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}


const viewports = {
  mobile: { width: 375, height: 667 },
  desktop: { width: 1280, height: 800 }
};


const variants = [
  'default',
  'loading',
  'custom-placeholder'
];

test.describe('Search Component Screenshots', () => {
  test.beforeAll(async ({ browser }) => {
    console.log('Checking if Storybook is running...');
    const page = await browser.newPage();
    try {
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
  for (const viewport of Object.entries(viewports)) {
    const [viewportName, viewportSize] = viewport;

    for (const variant of variants) {
      test(`Search component - ${variant} variant - ${viewportName} view`, async ({ page }) => {
        await page.setViewportSize(viewportSize);
        const storyUrl = `${storybookUrl}/iframe.html?id=features-search--${variant.toLowerCase()}&viewMode=story`;
        console.log(`Navigating to: ${storyUrl}`);
        await page.goto(storyUrl, { waitUntil: 'networkidle' });
        await page.waitForSelector('.search', { timeout: 30000 });
        await page.waitForTimeout(1000);
        const screenshotPath = path.join(screenshotsDir, `search-${variant.toLowerCase()}-${viewportName}.png`);
        console.log(`Taking screenshot: ${screenshotPath}`);
        
        await page.screenshot({
          path: screenshotPath,
          fullPage: false,
          timeout: 30000
        });
        expect(fs.existsSync(screenshotPath)).toBeTruthy();
      });
    }
  }
});