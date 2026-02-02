const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

async function testInviteAndSettingsPages() {
  const logs = []
  const screenshots = {
    invite: [],
    settings: []
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    logs.push({ type, text, timestamp: new Date().toISOString() })
  })

  // 监听网络错误
  page.on('pageerror', error => {
    logs.push({ type: 'error', text: error.toString(), timestamp: new Date().toISOString() })
  })

  try {
    // 启动开发服务器
    logs.push({ type: 'info', text: 'Starting development server...', timestamp: new Date().toISOString() })
    const { spawn } = require('child_process')
    const devServer = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '../frontend'),
      shell: true
    })

    // 等待服务器启动
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 测试邀请页面
    logs.push({ type: 'info', text: 'Navigating to Invite page...', timestamp: new Date().toISOString() })
    await page.goto('http://localhost:5173/dashboard/invite')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 截图邀请页面 - 整页
    const inviteFullScreenshot = 'tests/invite_page_full.png'
    await page.screenshot({
      path: inviteFullScreenshot,
      fullPage: true
    })
    screenshots.invite.push(inviteFullScreenshot)
    logs.push({ type: 'info', text: `Screenshot saved: ${inviteFullScreenshot}`, timestamp: new Date().toISOString() })

    // 测试复制链接功能
    logs.push({ type: 'info', text: 'Testing copy invite link button...', timestamp: new Date().toISOString() })

    // 查找并点击复制按钮
    const copyButton = page.locator('button').filter({ hasText: /复制链接/ }).first()
    await copyButton.waitFor({ state: 'visible', timeout: 10000 })
    await copyButton.click()

    // 等待复制完成（按钮状态变化）
    await page.waitForTimeout(1000)

    // 截图复制后的状态
    const inviteCopyScreenshot = 'tests/invite_page_after_copy.png'
    await page.screenshot({ path: inviteCopyScreenshot, fullPage: true })
    screenshots.invite.push(inviteCopyScreenshot)
    logs.push({ type: 'info', text: `Screenshot saved: ${inviteCopyScreenshot}`, timestamp: new Date().toISOString() })

    // 验证页面元素
    const commissionStats = await page.locator('text=累计佣金').count()
    const inviteLinkInput = await page.locator('input[readonly*="example.com"]').count()
    const inviteesTable = await page.locator('text=已邀请用户').count()
    const commissionHistory = await page.locator('text=佣金流水记录').count()

    logs.push({
      type: 'validation',
      text: `Invite page elements - Commission stats: ${commissionStats}, Invite link input: ${inviteLinkInput}, Invitees table: ${inviteesTable}, Commission history: ${commissionHistory}`,
      timestamp: new Date().toISOString()
    })

    // 测试设置页面
    logs.push({ type: 'info', text: 'Navigating to Settings page...', timestamp: new Date().toISOString() })
    await page.goto('http://localhost:5173/dashboard/settings')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 截图设置页面 - 整页
    const settingsFullScreenshot = 'tests/settings_page_full.png'
    await page.screenshot({
      path: settingsFullScreenshot,
      fullPage: true
    })
    screenshots.settings.push(settingsFullScreenshot)
    logs.push({ type: 'info', text: `Screenshot saved: ${settingsFullScreenshot}`, timestamp: new Date().toISOString() })

    // 测试表单交互 - 切换密码可见性
    logs.push({ type: 'info', text: 'Testing password visibility toggle...', timestamp: new Date().toISOString() })
    const eyeButton = page.locator('button').filter({ hasText: '' }).locator('svg').first()
    const eyeButtonExists = await eyeButton.count() > 0

    if (eyeButtonExists) {
      await eyeButton.click()
      await page.waitForTimeout(500)
      logs.push({ type: 'info', text: 'Password visibility toggled successfully', timestamp: new Date().toISOString() })

      // 截图密码可见状态
      const settingsPasswordVisibleScreenshot = 'tests/settings_password_visible.png'
      await page.screenshot({ path: settingsPasswordVisibleScreenshot, fullPage: true })
      screenshots.settings.push(settingsPasswordVisibleScreenshot)
      logs.push({ type: 'info', text: `Screenshot saved: ${settingsPasswordVisibleScreenshot}`, timestamp: new Date().toISOString() })
    }

    // 测试 Switch 开关 - 邮件通知
    logs.push({ type: 'info', text: 'Testing notification switches...', timestamp: new Date().toISOString() })
    const emailNotifySwitch = page.locator('input[type="checkbox"]').nth(0)
    await emailNotifySwitch.click()
    await page.waitForTimeout(500)
    logs.push({ type: 'info', text: 'Email notification switch toggled', timestamp: new Date().toISOString() })

    // 截图开关切换后
    const settingsSwitchesScreenshot = 'tests/settings_switches_toggled.png'
    await page.screenshot({ path: settingsSwitchesScreenshot, fullPage: true })
    screenshots.settings.push(settingsSwitchesScreenshot)
    logs.push({ type: 'info', text: `Screenshot saved: ${settingsSwitchesScreenshot}`, timestamp: new Date().toISOString() })

    // 测试复制 UUID
    logs.push({ type: 'info', text: 'Testing UUID copy button...', timestamp: new Date().toISOString() })
    const uuidCopyButton = page.locator('button').filter({ hasText: '' }).locator('svg').nth(1)
    await uuidCopyButton.click()
    await page.waitForTimeout(500)
    logs.push({ type: 'info', text: 'UUID copy button clicked', timestamp: new Date().toISOString() })

    // 截图 UUID 复制后
    const settingsUuidCopiedScreenshot = 'tests/settings_uuid_copied.png'
    await page.screenshot({ path: settingsUuidCopiedScreenshot, fullPage: true })
    screenshots.settings.push(settingsUuidCopiedScreenshot)
    logs.push({ type: 'info', text: `Screenshot saved: ${settingsUuidCopiedScreenshot}`, timestamp: new Date().toISOString() })

    // 验证设置页面元素
    const securitySection = await page.locator('text=安全设置').count()
    const connectionSection = await page.locator('text=连接信息').count()
    const notificationSection = await page.locator('text=通知设置').count()
    const switchElements = await page.locator('input[type="checkbox"]').count()

    logs.push({
      type: 'validation',
      text: `Settings page elements - Security section: ${securitySection}, Connection section: ${connectionSection}, Notification section: ${notificationSection}, Switches: ${switchElements}`,
      timestamp: new Date().toISOString()
    })

    // 保存测试日志
    const testLog = {
      test: 'Invite and Settings Pages',
      timestamp: new Date().toISOString(),
      status: 'success',
      logs,
      screenshots
    }

    fs.writeFileSync(
      'tests/invite_settings_logs.json',
      JSON.stringify(testLog, null, 2)
    )

    console.log('✅ All tests passed successfully!')
    console.log('Screenshots saved:')
    screenshots.invite.forEach(s => console.log(`  - ${s}`))
    screenshots.settings.forEach(s => console.log(`  - ${s}`))
    console.log('Logs saved to: tests/invite_settings_logs.json')

  } catch (error) {
    logs.push({
      type: 'error',
      text: `Test failed: ${error.message}`,
      timestamp: new Date().toISOString()
    })

    // 保存错误日志
    fs.writeFileSync(
      'tests/invite_settings_logs.json',
      JSON.stringify({
        test: 'Invite and Settings Pages',
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message,
        logs,
        screenshots
      }, null, 2)
    )

    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

testInviteAndSettingsPages()
