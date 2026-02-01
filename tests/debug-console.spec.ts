import { test, expect } from '@playwright/test';

test.describe('Debug Public URL Console Errors', () => {
  const baseUrl = 'https://test-spanel-fastapi.freessr.bid';

  test('should capture console errors from public URL', async ({ page }) => {
    const consoleLogs: string[] = [];
    const errorLogs: string[] = [];

    // 监听所有控制台消息
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleLogs.push(`[${type}] ${text}`);

      if (type === 'error') {
        errorLogs.push(text);
      }
    });

    // 监听页面错误
    page.on('pageerror', exception => {
      console.error('Page Error:', exception);
      errorLogs.push(`PAGE ERROR: ${exception.message}`);
    });

    // 监听请求失败
    page.on('requestfailed', request => {
      const failure = request.failure();
      const url = request.url();
      console.error(`Request Failed: ${url} - ${failure?.errorMessage}`);
      errorLogs.push(`REQUEST FAILED: ${url} - ${failure?.errorMessage}`);
    });

    console.log(`🔍 正在访问公网地址: ${baseUrl}`);
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // 等待一段时间让页面完全加载
    await page.waitForTimeout(3000);

    // 打印页面内容（用于调试）
    const bodyText = await page.bodyText();
    console.log('\n📄 页面内容长度:', bodyText.length);
    console.log('页面内容预览:', bodyText.substring(0, 200));

    // 检查是否有 React 根元素
    const hasRootElement = await page.locator('#root').count();
    console.log(`\n🔍 查找 #root 元素: ${hasRootElement > 0 ? '找到' : '未找到'}`);

    // 截图
    await page.screenshot({
      path: '/root/git/spanel-fastapi/tests/screenshots/debug-public-url.png',
      fullPage: true
    });

    // 打印所有控制台日志
    console.log('\n📋 所有控制台日志:');
    consoleLogs.forEach(log => console.log(`  ${log}`));

    // 打印所有错误
    if (errorLogs.length > 0) {
      console.log('\n❌ 发现错误:');
      errorLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('\n✅ 未发现控制台错误');
    }

    // 检查资源加载情况
    const resources = await page.evaluate(() => {
      const performance = (window as any).performance;
      if (!performance || !performance.getEntriesByType) {
        return [];
      }
      return performance.getEntriesByType('resource').map((r: any) => ({
        name: r.name,
        duration: r.duration,
        transferSize: r.transferSize
      }));
    });

    console.log('\n📦 资源加载情况:');
    const failedResources = resources.filter((r: any) => r.transferSize === 0 && r.duration > 0);
    if (failedResources.length > 0) {
      console.log('⚠️ 可能加载失败的资源:');
      failedResources.forEach((r: any) => console.log(`  ${r.name}`));
    }

    // 期望不应该有错误
    expect(errorLogs.length).toBe(0);
  });

  test('should check static asset accessibility', async ({ page }) => {
    const baseUrl = 'https://test-spanel-fastapi.freessr.bid';

    // 访问主页
    await page.goto(baseUrl);

    // 获取所有 script 和 link 标签
    const assets = await page.evaluate(() => {
      const assets: string[] = [];

      document.querySelectorAll('script[src]').forEach(el => {
        assets.push((el as HTMLScriptElement).src);
      });

      document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
        assets.push((el as HTMLLinkElement).href);
      });

      return assets;
    });

    console.log('\n🔍 检查静态资源可访问性:');
    for (const asset of assets) {
      try {
        const response = await page.request.get(asset);
        const status = response.status();
        const contentType = response.headers()['content-type'] || 'unknown';

        if (status === 200) {
          console.log(`✅ ${asset}`);
          console.log(`   Status: ${status}, Type: ${contentType}`);
        } else {
          console.log(`❌ ${asset}`);
          console.log(`   Status: ${status}`);
        }
      } catch (error) {
        console.log(`❌ ${asset}`);
        console.log(`   Error: ${error}`);
      }
    }
  });
});
