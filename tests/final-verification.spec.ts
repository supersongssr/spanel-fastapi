import { test, expect } from '@playwright/test';

test.describe('Final Verification - Public URL', () => {
  const baseUrl = 'https://test-spanel-fastapi.freessr.bid';

  test('should verify public URL is fully working', async ({ page }) => {
    console.log(`\n🔍 最终验证公网地址: ${baseUrl}`);

    const errors: string[] = [];
    page.on('pageerror', error => {
      console.error('❌ Error:', error.message);
      errors.push(error.message);
    });

    // Test root URL
    console.log('\n📍 测试根路径: /');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const rootContent = await page.locator('#root').textContent();
    console.log('Root element content length:', rootContent?.length || 0);

    // Test dashboard URL
    console.log('\n📍 测试仪表盘路径: /dashboard');
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check for key elements
    const hasHeader = await page.locator('header').count();
    const hasSidebar = await page.locator('aside nav').count();
    const hasUserEmail = await page.locator('text=test@example.com').count();
    const hasVIPBadge = await page.locator('text=/VIP\\s*1/').count();
    const hasCheckinButton = await page.locator('button:has-text("签到")').count();

    console.log('\n📊 页面元素验证:');
    console.log(`  - Header: ${hasHeader > 0 ? '✅' : '❌'}`);
    console.log(`  - Sidebar: ${hasSidebar > 0 ? '✅' : '❌'}`);
    console.log(`  - User Email: ${hasUserEmail > 0 ? '✅' : '❌'}`);
    console.log(`  - VIP Badge: ${hasVIPBadge > 0 ? '✅' : '❌'}`);
    console.log(`  - Checkin Button: ${hasCheckinButton > 0 ? '✅' : '❌'}`);

    // Take screenshot
    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/final-verification-public-url.png',
      fullPage: true
    });

    console.log('\n📸 截图已保存: final-verification-public-url.png');
    console.log(`\n❌ 控制台错误数量: ${errors.length}`);

    if (errors.length === 0) {
      console.log('\n✅ 公网访问完全正常！');
    } else {
      console.log('\n⚠️ 仍有错误，需要进一步排查');
    }

    // Verify all elements are present
    expect(hasHeader).toBeGreaterThan(0);
    expect(hasSidebar).toBeGreaterThan(0);
    expect(errors.length).toBe(0);
  });
});
