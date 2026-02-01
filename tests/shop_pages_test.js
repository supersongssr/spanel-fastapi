const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  // 收集日志
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  console.log('🧪 Starting Shop Pages Testing...\n');

  // 测试套餐购买页
  console.log('📦 Testing Shop Page...');
  try {
    await page.goto('https://test-spanel-fastapi.freessr.bid/dashboard/shop', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const shopScreenshot = '/work/shop_page.png';
    await page.screenshot({ path: shopScreenshot, fullPage: true });
    console.log(`✅ Shop page screenshot saved: ${shopScreenshot}`);

    const shopTitle = await page.title();
    console.log(`   Page title: ${shopTitle}`);

    const shopContent = await page.evaluate(() => document.body.innerText);
    console.log(`   Content length: ${shopContent.length} characters`);

    // 检查关键元素
    const packageCount = await page.locator('text=¥').count();
    console.log(`   Found ${packageCount} price elements`);

  } catch (error) {
    console.error(`❌ Error testing shop page: ${error.message}`);
  }

  console.log('\n💰 Testing TopUp Page...');
  try {
    await page.goto('https://test-spanel-fastapi.freessr.bid/dashboard/topup', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const topupScreenshot = '/work/topup_page.png';
    await page.screenshot({ path: topupScreenshot, fullPage: true });
    console.log(`✅ TopUp page screenshot saved: ${topupScreenshot}`);

    const topupTitle = await page.title();
    console.log(`   Page title: ${topupTitle}`);

    const topupContent = await page.evaluate(() => document.body.innerText);
    console.log(`   Content length: ${topupContent.length} characters`);

    // 检查关键元素
    const paymentMethods = await page.locator('text=支付宝').count() +
                          await page.locator('text=微信支付').count();
    console.log(`   Found ${paymentMethods} payment methods`);

  } catch (error) {
    console.error(`❌ Error testing topup page: ${error.message}`);
  }

  // 保存日志
  const logs = {
    consoleLogs,
    pageErrors,
    timestamp: new Date().toISOString()
  };

  const logsPath = '/work/shop_pages_logs.json';
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
  console.log(`\n📋 Logs saved to: ${logsPath}`);

  if (consoleLogs.length > 0) {
    console.log('\n🔍 Console Logs:');
    consoleLogs.forEach(log => {
      console.log(`   [${log.type}] ${log.text}`);
    });
  }

  if (pageErrors.length > 0) {
    console.log('\n⚠️ Page Errors:');
    pageErrors.forEach(error => {
      console.log(`   ${error.message}`);
    });
  }

  await browser.close();
  console.log('\n✅ All tests completed!');
})();
