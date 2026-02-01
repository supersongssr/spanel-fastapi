import { test, expect } from '@playwright/test';

test.describe('Compare Root vs Dashboard Access', () => {
  const baseUrl = 'https://test-spanel-fastapi.freessr.bid';

  test('should test root URL /', async ({ page }) => {
    console.log('\n🔍 测试根路径: /');

    const errors: string[] = [];
    page.on('pageerror', error => {
      console.error('❌ Error:', error.message);
      errors.push(error.message);
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const rootContent = await page.locator('#root').textContent();
    console.log('Root element content length:', rootContent?.length || 0);

    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/test-root-url.png',
      fullPage: true
    });

    console.log('Errors found:', errors.length);
  });

  test('should test /dashboard URL', async ({ page }) => {
    console.log('\n🔍 测试仪表盘路径: /dashboard');

    const errors: string[] = [];
    page.on('pageerror', error => {
      console.error('❌ Error:', error.message);
      errors.push(error.message);
    });

    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const rootContent = await page.locator('#root').textContent();
    console.log('Root element content length:', rootContent?.length || 0);

    // Check for specific elements
    const hasHeader = await page.locator('header').count();
    const hasSidebar = await page.locator('aside').count();

    console.log('Header count:', hasHeader);
    console.log('Sidebar count:', hasSidebar);

    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/test-dashboard-url.png',
      fullPage: true
    });

    console.log('Errors found:', errors.length);
    expect(hasHeader).toBeGreaterThan(0);
  });
});
