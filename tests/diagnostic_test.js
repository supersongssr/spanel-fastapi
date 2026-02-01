const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    recordVideo: { dir: '/work/videos', size: { width: 1920, height: 1080 } }
  });

  const page = await context.newPage();

  // Collect console logs
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Collect network errors
  const networkErrors = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });

  console.log('Navigating to https://test-spanel-fastapi.freessr.bid ...');
  try {
    await page.goto('https://test-spanel-fastapi.freessr.bid', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('Page loaded successfully');

    // Wait a bit more to ensure all dynamic content loads
    await page.waitForTimeout(3000);

    // Take screenshot
    const screenshotPath = '/work/diagnostic_result.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Get page content
    const content = await page.content();
    const contentPath = '/work/page_content.html';
    fs.writeFileSync(contentPath, content);
    console.log(`Page content saved to: ${contentPath}`);

    // Check if page is empty
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`Body text length: ${bodyText.length}`);
    console.log(`Body text preview: ${bodyText.substring(0, 200)}`);

  } catch (error) {
    console.error('Error navigating to page:', error.message);
  }

  // Save logs
  const logs = {
    consoleLogs,
    networkErrors,
    pageErrors,
    timestamp: new Date().toISOString()
  };

  const logsPath = '/work/diagnostic_logs.json';
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
  console.log(`Logs saved to: ${logsPath}`);

  console.log('\n=== Console Logs ===');
  consoleLogs.forEach(log => {
    console.log(`[${log.type}] ${log.text}`);
  });

  console.log('\n=== Network Errors ===');
  networkErrors.forEach(error => {
    console.log(`[${error.status}] ${error.url} - ${error.statusText}`);
  });

  console.log('\n=== Page Errors ===');
  pageErrors.forEach(error => {
    console.log(`ERROR: ${error.message}`);
    if (error.stack) {
      console.log(error.stack);
    }
  });

  await browser.close();
})();
