import { test, expect } from '@playwright/test';

test.describe('Test Local Preview Server', () => {
  test('should render correctly on local preview server', async ({ page }) => {
    console.log('\n🔍 测试本地预览服务器: http://localhost:4173');

    const errors: string[] = [];
    page.on('pageerror', error => {
      console.error('❌ Error:', error.message);
      errors.push(error.message);
    });

    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const rootContent = await page.locator('#root').textContent();
    console.log('Root element content length:', rootContent?.length || 0);

    const hasHeader = await page.locator('header').count();
    const hasSidebar = await page.locator('aside').count();

    console.log('Header count:', hasHeader);
    console.log('Sidebar count:', hasSidebar);
    console.log('Errors found:', errors.length);

    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/test-local-preview.png',
      fullPage: true
    });

    expect(hasHeader).toBeGreaterThan(0);
    console.log('✅ 本地预览服务器工作正常！');
  });
});
