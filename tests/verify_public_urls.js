const { chromium } = require('playwright')
const fs = require('fs')

async function verifyPublicURLs() {
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
    // 监听控制台消息
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()
      if (type === 'error' || type === 'warning') {
        logs.push({ type, text, url: page.url(), timestamp: new Date().toISOString() })
      }
    })

    // 监听页面错误
    page.on('pageerror', error => {
      logs.push({ type: 'pageerror', text: error.toString(), url: page.url(), timestamp: new Date().toISOString() })
    })

    // 监听网络请求失败
    page.on('requestfailed', request => {
      const failure = request.failure()
      if (failure) {
        logs.push({
          type: 'requestfailed',
          url: request.url(),
          error: failure.errorText,
          timestamp: new Date().toISOString()
        })
      }
    })

    // 测试邀请页面
    console.log('🔍 访问邀请页面...')
    logs.push({ type: 'info', text: 'Navigating to invite page', timestamp: new Date().toISOString() })

    await page.goto('https://test-spanel-fastapi.freessr.bid/dashboard/invite', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    await page.waitForTimeout(5000)

    const inviteScreenshot = 'tests/invite_public.png'
    await page.screenshot({ path: inviteScreenshot, fullPage: true })
    screenshots.push(inviteScreenshot)
    console.log(`✅ 邀请页面截图: ${inviteScreenshot}`)

    // 检查关键元素
    const commissionTitle = await page.locator('text=累计佣金').count()
    const inviteLink = await page.locator('input[readonly*="example"]').count()
    logs.push({
      type: 'validation',
      text: `Invite page - 累计佣金: ${commissionTitle}, 邀请链接输入框: ${inviteLink}`,
      timestamp: new Date().toISOString()
    })

    // 测试设置页面
    console.log('🔍 访问设置页面...')
    logs.push({ type: 'info', text: 'Navigating to settings page', timestamp: new Date().toISOString() })

    await page.goto('https://test-spanel-fastapi.freessr.bid/dashboard/settings', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    await page.waitForTimeout(5000)

    const settingsScreenshot = 'tests/settings_public.png'
    await page.screenshot({ path: settingsScreenshot, fullPage: true })
    screenshots.push(settingsScreenshot)
    console.log(`✅ 设置页面截图: ${settingsScreenshot}`)

    // 检查关键元素
    const securitySection = await page.locator('text=安全设置').count()
    const connectionSection = await page.locator('text=连接信息').count()
    const notificationSection = await page.locator('text=通知设置').count()
    logs.push({
      type: 'validation',
      text: `Settings page - 安全设置: ${securitySection}, 连接信息: ${connectionSection}, 通知设置: ${notificationSection}`,
      timestamp: new Date().toISOString()
    })

    // 保存测试报告
    const report = {
      test: 'Public URL Verification',
      timestamp: new Date().toISOString(),
      status: 'success',
      urls: [
        'https://test-spanel-fastapi.freessr.bid/dashboard/invite',
        'https://test-spanel-fastapi.freessr.bid/dashboard/settings'
      ],
      screenshots,
      logs,
      validation: {
        invitePage: {
          commissionStats: commissionTitle > 0,
          inviteLinkInput: inviteLink > 0
        },
        settingsPage: {
          securitySection: securitySection > 0,
          connectionSection: connectionSection > 0,
          notificationSection: notificationSection > 0
        }
      }
    }

    fs.writeFileSync('tests/public_verification.json', JSON.stringify(report, null, 2))

    console.log('\n📊 验证报告:')
    console.log(`   邀请页面 - 累计佣金: ${commissionTitle > 0 ? '✅' : '❌'}`)
    console.log(`   邀请页面 - 邀请链接: ${inviteLink > 0 ? '✅' : '❌'}`)
    console.log(`   设置页面 - 安全设置: ${securitySection > 0 ? '✅' : '❌'}`)
    console.log(`   设置页面 - 连接信息: ${connectionSection > 0 ? '✅' : '❌'}`)
    console.log(`   设置页面 - 通知设置: ${notificationSection > 0 ? '✅' : '❌'}`)

    if (logs.filter(l => l.type === 'error' || l.type === 'pageerror' || l.type === 'requestfailed').length > 0) {
      console.log('\n⚠️  发现控制台错误或资源加载失败:')
      logs.filter(l => l.type === 'error' || l.type === 'pageerror' || l.type === 'requestfailed')
        .forEach(log => console.log(`   ${log.type}: ${log.text || log.error}`))
    } else {
      console.log('\n✅ 未发现控制台错误或资源加载问题')
    }

    console.log('\n🎉 验证完成！')

  } catch (error) {
    console.error('❌ 验证失败:', error.message)
    logs.push({ type: 'fatal', text: error.message, timestamp: new Date().toISOString() })
    fs.writeFileSync('tests/public_verification.json', JSON.stringify({ status: 'failed', error: error.message, logs }, null, 2))
  } finally {
    await browser.close()
  }
}

verifyPublicURLs()
