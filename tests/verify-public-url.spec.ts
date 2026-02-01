import { test, expect } from '@playwright/test';

test.describe('Verify Public URL is Working', () => {
  const baseUrl = 'https://test-spanel-fastapi.freessr.bid';

  test('should verify the page renders correctly on public URL', async ({ page }) => {
    console.log(`🔍 访问公网地址: ${baseUrl}`);

    // 监听控制台错误
    const errors: string[] = [];
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
      errors.push(error.message);
    });

    // 访问页面
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 截图
    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/verify-public-url.png',
      fullPage: true
    });

    // 检查 #root 元素是否存在
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // 检查是否有内容渲染
    const rootText = await root.textContent();
    console.log('✅ #root 元素内容长度:', rootText?.length || 0);

    // 检查关键元素
    const hasHeader = await page.locator('header').count();
    const hasSidebar = await page.locator('aside').count();
    const hasMain = await page.locator('main').count();

    console.log(`📊 页面元素统计:`);
    console.log(`  - Header: ${hasHeader}`);
    console.log(`  - Sidebar: ${hasSidebar}`);
    console.log(`  - Main: ${hasMain}`);

    // 打印控制台日志
    const logs: string[] = [];
    page.on('console', msg => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // 等待一下收集所有日志
    await page.waitForTimeout(1000);

    if (logs.length > 0) {
      console.log('\n📋 控制台日志:');
      logs.slice(0, 10).forEach(log => console.log(`  ${log}`));
    }

    // 验证页面有内容
    expect(hasHeader + hasSidebar + hasMain).toBeGreaterThan(0);

    console.log('\n✅ 公网页面渲染成功！');
  });
});
