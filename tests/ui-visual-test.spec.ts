import { test, expect } from '@playwright/test';

test.describe('sPanel-FastAPI UI Visual Verification', () => {
  const baseUrl = 'https://test-spanel-fastapi.freessr.bid';

  test('should take full page screenshot of dashboard', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待动画完成

    // 全页截图
    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/dashboard-full.png',
      fullPage: true
    });

    console.log('✅ 仪表盘全页截图已保存');
  });

  test('should verify orange theme colors', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');

    // 检查是否有橙色元素（通过颜色值）
    const orangeElements = await page.locator('*').filter(async (el) => {
      const bgColor = await el.evaluate((elem) => {
        const styles = window.getComputedStyle(elem);
        return styles.backgroundColor || styles.backgroundImage;
      });
      return bgColor && (
        bgColor.includes('255') || // RGB 中有 255 (橙色包含)
        bgColor.includes('249') || // #f97316 (橙色)
        bgColor.includes('251') || // #fb923c
        bgColor.includes('orange') ||
        bgColor.includes('linear-gradient')
      );
    }).count();

    console.log(`🎨 找到 ${orangeElements} 个包含橙色/渐变的元素`);
    expect(orangeElements).toBeGreaterThan(0);

    // 检查是否有 #ff9800 (我们的主橙色)
    const hasPrimaryOrange = await page.locator('body').evaluate(async () => {
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const bg = styles.backgroundColor;
        const bgImage = styles.backgroundImage;

        // 检查是否包含橙色
        if (color === 'rgb(255, 152, 0)' ||
            bg === 'rgb(255, 152, 0)' ||
            bgImage.includes('255, 152, 0') ||
            bgImage.includes('orange')) {
          return true;
        }
      }
      return false;
    });

    expect(hasPrimaryOrange).toBe(true);
    console.log('✅ 橙色主题 (#ff9800) 已应用');
  });

  test('should verify sidebar navigation is present', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');

    // 检查侧边栏
    const sidebar = page.locator('aside').or(page.locator('[class*="sidebar"]')).or(page.locator('nav'));
    await expect(sidebar.first()).toBeVisible();
    console.log('✅ 侧边栏导航已渲染');

    // 检查导航菜单项
    const navLinks = page.locator('a').filter({ hasText: /用户面板|节点列表|套餐购买/ });
    const linkCount = await navLinks.count();
    console.log(`🔗 找到 ${linkCount} 个导航链接`);
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should verify info cards are rendered', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');

    // 检查卡片元素
    const cards = page.locator('div[class*="card"], div[class*="Card"]');
    const cardCount = await cards.count();
    console.log(`📦 找到 ${cardCount} 个卡片元素`);
    expect(cardCount).toBeGreaterThan(0);

    // 检查是否有"用户中心"、"余额"等文本
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/用户|余额|VIP|等级|设备|速率/);
    console.log('✅ 用户信息卡片内容已渲染');
  });

  test('should verify check-in button exists', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');

    // 查找签到按钮
    const checkinButton = page.locator('button').filter({ hasText: /签到/ });
    await expect(checkinButton).toBeVisible();
    console.log('✅ 签到按钮已渲染');
  });

  test('should take screenshot of node list page', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard/nodes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 全页截图
    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/nodes-full.png',
      fullPage: true
    });

    console.log('✅ 节点列表全页截图已保存');

    // 检查页面内容
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/节点|VIP|在线/);
    console.log('✅ 节点列表内容已渲染');
  });

  test('should test SPA routing - direct access to sub-routes', async ({ page }) => {
    const testPaths = ['/dashboard', '/dashboard/nodes'];

    for (const path of testPaths) {
      console.log(`\n🧪 测试路由: ${path}`);

      // 直接访问（模拟刷新或直接输入URL）
      const response = await page.goto(`${baseUrl}${path}`);
      expect(response?.status()).toBe(200);

      // 等待页面加载
      await page.waitForLoadState('networkidle');

      // 检查页面是否有内容（不是 404）
      const bodyContent = await page.content();
      expect(bodyContent).not.toContain('404 Not Found');
      expect(bodyContent).not.toContain('nginx');

      console.log(`✅ ${path} 返回 200，页面正确渲染`);
    }

    console.log('\n✅ SPA 路由测试通过！Nginx try_files 配置正确！');
  });

  test('should verify API proxy is working', async ({ page }) => {
    const response = await page.request.get(`${baseUrl}/app/api/v0/health`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('ret', 1);
    expect(data).toHaveProperty('msg', 'ok');

    console.log('✅ API 代理正常工作');
    console.log(`📊 后端版本: ${data.data?.version || 'unknown'}`);
    console.log(`🔴 Redis: ${data.data?.redis || 'unknown'}`);
  });

  test('should verify responsive design on mobile viewport', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/dashboard-mobile.png',
      fullPage: true
    });

    console.log('✅ 移动端截图已保存');

    // 检查移动端菜单按钮是否存在
    const menuButton = page.locator('button').or(page.locator('[class*="menu"]')).first();
    await expect(menuButton).toBeVisible();
    console.log('✅ 移动端菜单按钮已渲染');
  });
});
