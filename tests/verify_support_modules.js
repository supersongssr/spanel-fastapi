const { chromium } = require('playwright')
const fs = require('fs')

async function verifySupportModules() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--ignore-ssl-errors', '--ignore-certificate-errors-spki-list']
  })

  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  })

  const page = await context.newPage()
  const logs = []
  const screenshots = []

  try {
    // 监听控制台
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()
      if (type === 'error' || type === 'warning') {
        logs.push({ type, text, url: page.url(), timestamp: new Date().toISOString() })
      }
    })

    // 测试技术支持页面
    console.log('🔍 访问技术支持页面...')
    await page.goto('https://test-spanel-fastapi.freessr.bid/dashboard/tickets', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })
    await page.waitForTimeout(5000)

    const ticketsScreenshot = 'tests/tickets_public.png'
    await page.screenshot({ path: ticketsScreenshot, fullPage: true })
    screenshots.push(ticketsScreenshot)
    console.log(`✅ 技术支持页面截图: ${ticketsScreenshot}`)

    const ticketsStats = await page.locator('text=总工单').count()
    const ticketList = await page.locator('text=我的工单').count()
    logs.push({
      type: 'validation',
      text: `Tickets page - 统计卡片: ${ticketsStats}, 工单列表: ${ticketList}`,
      timestamp: new Date().toISOString()
    })

    // 测试购买记录页面
    console.log('🔍 访问购买记录页面...')
    await page.goto('https://test-spanel-fastapi.freessr.bid/dashboard/purchases', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })
    await page.waitForTimeout(5000)

    const purchasesScreenshot = 'tests/purchases_public.png'
    await page.screenshot({ path: purchasesScreenshot, fullPage: true })
    screenshots.push(purchasesScreenshot)
    console.log(`✅ 购买记录页面截图: ${purchasesScreenshot}`)

    const purchasesStats = await page.locator('text=总订单数').count()
    const purchaseTable = await page.locator('text=订单列表').count()
    logs.push({
      type: 'validation',
      text: `Purchases page - 统计卡片: ${purchasesStats}, 订单表格: ${purchaseTable}`,
      timestamp: new Date().toISOString()
    })

    // 测试流量记录页面
    console.log('🔍 访问流量记录页面...')
    await page.goto('https://test-spanel-fastapi.freessr.bid/dashboard/traffic', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })
    await page.waitForTimeout(5000)

    const trafficScreenshot = 'tests/traffic_public.png'
    await page.screenshot({ path: trafficScreenshot, fullPage: true })
    screenshots.push(trafficScreenshot)
    console.log(`✅ 流量记录页面截图: ${trafficScreenshot}`)

    const trafficStats = await page.locator('text=已用流量').count()
    const progressBar = await page.locator('text=总流量使用情况').count()
    const dailyRecords = await page.locator('text=每日流量记录').count()
    logs.push({
      type: 'validation',
      text: `Traffic page - 统计卡片: ${trafficStats}, 进度条: ${progressBar}, 每日记录: ${dailyRecords}`,
      timestamp: new Date().toISOString()
    })

    // 保存报告
    const report = {
      test: 'Support & Traffic Modules Verification',
      timestamp: new Date().toISOString(),
      status: 'success',
      urls: [
        'https://test-spanel-fastapi.freessr.bid/dashboard/tickets',
        'https://test-spanel-fastapi.freessr.bid/dashboard/purchases',
        'https://test-spanel-fastapi.freessr.bid/dashboard/traffic',
      ],
      screenshots,
      logs,
      validation: {
        tickets: { stats: ticketsStats > 0, list: ticketList > 0 },
        purchases: { stats: purchasesStats > 0, table: purchaseTable > 0 },
        traffic: { stats: trafficStats > 0, progress: progressBar > 0, daily: dailyRecords > 0 },
      }
    }

    fs.writeFileSync('tests/support_modules_verification.json', JSON.stringify(report, null, 2))

    console.log('\n📊 验证报告:')
    console.log(`   技术支持 - 统计卡片: ${ticketsStats > 0 ? '✅' : '❌'}`)
    console.log(`   技术支持 - 工单列表: ${ticketList > 0 ? '✅' : '❌'}`)
    console.log(`   购买记录 - 统计卡片: ${purchasesStats > 0 ? '✅' : '❌'}`)
    console.log(`   购买记录 - 订单表格: ${purchaseTable > 0 ? '✅' : '❌'}`)
    console.log(`   流量记录 - 统计卡片: ${trafficStats > 0 ? '✅' : '❌'}`)
    console.log(`   流量记录 - 进度条: ${progressBar > 0 ? '✅' : '❌'}`)
    console.log(`   流量记录 - 每日记录: ${dailyRecords > 0 ? '✅' : '❌'}`)

    if (logs.filter(l => l.type === 'error').length > 0) {
      console.log('\n⚠️  发现控制台错误:')
      logs.filter(l => l.type === 'error').forEach(log => console.log(`   ${log.text}`))
    } else {
      console.log('\n✅ 未发现控制台错误')
    }

    console.log('\n🎉 所有模块验证完成！')

  } catch (error) {
    console.error('❌ 验证失败:', error.message)
    logs.push({ type: 'fatal', text: error.message, timestamp: new Date().toISOString() })
    fs.writeFileSync('tests/support_modules_verification.json', JSON.stringify({ status: 'failed', error: error.message, logs }, null, 2))
  } finally {
    await browser.close()
  }
}

verifySupportModules()
