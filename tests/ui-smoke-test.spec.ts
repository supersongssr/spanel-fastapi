import { test, expect } from '@playwright/test';

test.describe('sPanel-FastAPI UI Smoke Test', () => {
  const baseUrl = 'https://test-spanel-fastapi.freessr.bid';

  test('should load dashboard page and render orange theme cards', async ({ page }) => {
    // 访问仪表盘页面
    await page.goto(`${baseUrl}/dashboard`);

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 截图保存
    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/dashboard.png',
      fullPage: true
    });

    // 验证页面标题
    await expect(page).toHaveTitle(/frontend/);

    // 验证橙色主题是否存在（检查渐变橙色元素）
    const orangeHeader = page.locator('header.bg-gradient-orange, .bg-gradient-orange');
    await expect(orangeHeader).toBeVisible();
    console.log('✅ 橙色主题头部已渲染');

    // 验证侧边栏导航是否存在
    const sidebar = page.locator('aside nav');
    await expect(sidebar).toBeVisible();
    console.log('✅ 侧边栏导航已渲染');

    // 验证用户信息卡片（4个统计卡片）
    const infoCards = page.locator('.card-material, [class*="card"]').filter({ hasText: /账号等级|余额|在线设备|端口速率/ });
    const cardCount = await infoCards.count();
    console.log(`📊 找到 ${cardCount} 个信息卡片`);
    expect(cardCount).toBeGreaterThanOrEqual(4);

    // 验证 VIP 徽章
    const vipBadge = page.locator('text=/VIP\\s*\\d+/');
    await expect(vipBadge).toBeVisible();
    console.log('✅ VIP 徽章已显示');

    // 验证签到按钮
    const checkinButton = page.locator('button:has-text("签到")');
    await expect(checkinButton).toBeVisible();
    console.log('✅ 签到按钮已渲染');

    // 验证流量进度条
    const progressBars = page.locator('.progress-bar, [class*="progress"]');
    const progressCount = await progressBars.count();
    console.log(`📈 找到 ${progressCount} 个进度条`);
    expect(progressCount).toBeGreaterThan(0);

    console.log('\n✅ 仪表盘页面所有元素验证通过！');
  });

  test('should navigate to node list and render node cards', async ({ page }) => {
    // 访问节点列表页面
    await page.goto(`${baseUrl}/dashboard/nodes`);

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/nodes.png',
      fullPage: true
    });

    // 验证节点分组标题（橙色渐变按钮）
    const nodeGroups = page.locator('.bg-gradient-orange');
    const groupCount = await nodeGroups.count();
    console.log(`🗂️ 找到 ${groupCount} 个节点分组`);
    expect(groupCount).toBeGreaterThan(0);

    // 验证节点卡片
    const nodeCards = page.locator('.card-material, .card');
    const cardCount = await nodeCards.count();
    console.log(`📦 找到 ${cardCount} 个节点卡片`);
    expect(cardCount).toBeGreaterThan(0);

    // 验证节点在线状态（呼吸灯效果）
    const onlineBadges = page.locator('text=/在线/Online/');
    const onlineCount = await onlineBadges.count();
    console.log(`🟢 找到 ${onlineCount} 个在线节点`);

    console.log('\n✅ 节点列表页面所有元素验证通过！');
  });

  test('should test SPA routing with try_files (no 404 on refresh)', async ({ page }) => {
    // 测试直接访问子路由
    const testPaths = [
      '/dashboard',
      '/dashboard/nodes',
    ];

    for (const path of testPaths) {
      console.log(`\n🧪 测试路由: ${path}`);

      // 直接访问路由（模拟刷新或直接输入URL）
      await page.goto(`${baseUrl}${path}`);
      await page.waitForLoadState('networkidle');

      // 检查是否返回 200（而不是 404）
      const response = await page.goto(`${baseUrl}${path}`);
      expect(response?.status()).toBe(200);

      // 验证页面内容是否正确渲染（不是 Nginx 404 页面）
      const bodyText = await page.evaluate(() => document.body.innerText);
      expect(bodyText).not.toContain('404');
      expect(bodyText).not.toContain('Not Found');
      expect(bodyText).not.toContain('nginx');

      console.log(`✅ ${path} 返回 200，页面正确渲染`);
    }

    console.log('\n✅ SPA 路由测试通过！Nginx try_files 配置正确！');
  });

  test('should verify API proxy is working', async ({ page }) => {
    // 测试 API 代理
    const response = await page.request.get(`${baseUrl}/app/api/v0/health`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('ret', 1);
    expect(data).toHaveProperty('msg', 'ok');

    console.log('✅ API 代理正常工作');
    console.log(`📊 API 响应:`, JSON.stringify(data, null, 2));
  });
});
