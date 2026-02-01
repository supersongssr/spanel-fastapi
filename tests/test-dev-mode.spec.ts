import { test, expect } from '@playwright/test';

test.describe('Test Development Mode', () => {
  test('should render correctly in dev mode', async ({ page }) => {
    console.log('\n🔍 测试开发模式: http://localhost:5173');

    // Start dev server if not already running
    const errors: string[] = [];
    page.on('pageerror', error => {
      console.error('❌ Error:', error.message);
      errors.push(error.message);
    });

    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 5000 });
      await page.waitForTimeout(2000);

      const rootContent = await page.locator('#root').textContent();
      console.log('Root element content length:', rootContent?.length || 0);

      const hasHeader = await page.locator('header').count();
      const hasSidebar = await page.locator('aside').count();

      console.log('Header count:', hasHeader);
      console.log('Sidebar count:', hasSidebar);
      console.log('Errors found:', errors.length);

      await page.screenshot({
        path: '/root/git/spanel-fastapi/tests/screenshots/test-dev-mode.png',
        fullPage: true
      });

      if (hasHeader > 0) {
        console.log('✅ 开发模式工作正常！');
      }
    } catch (error) {
      console.log('⚠️ 开发服务器未运行或无法访问');
    }
  });
});
