const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

async function testPages() {
  const logs = []
  const screenshots = []

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    logs.push({ type: 'info', text: 'Navigating to Invite page...', timestamp: new Date().toISOString() })
    await page.goto('http://localhost:5173/dashboard/invite')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const inviteScreenshot = 'tests/invite_page.png'
    await page.screenshot({ path: inviteScreenshot, fullPage: true })
    screenshots.push(inviteScreenshot)
    logs.push({ type: 'info', text: `Screenshot saved: ${inviteScreenshot}`, timestamp: new Date().toISOString() })

    logs.push({ type: 'info', text: 'Navigating to Settings page...', timestamp: new Date().toISOString() })
    await page.goto('http://localhost:5173/dashboard/settings')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const settingsScreenshot = 'tests/settings_page.png'
    await page.screenshot({ path: settingsScreenshot, fullPage: true })
    screenshots.push(settingsScreenshot)
    logs.push({ type: 'info', text: `Screenshot saved: ${settingsScreenshot}`, timestamp: new Date().toISOString() })

    const testLog = {
      test: 'Invite and Settings Pages',
      timestamp: new Date().toISOString(),
      status: 'success',
      logs,
      screenshots
    }

    fs.writeFileSync('tests/invite_settings_logs.json', JSON.stringify(testLog, null, 2))

    console.log('✅ Screenshots captured successfully!')
    screenshots.forEach(s => console.log(`  - ${s}`))

  } catch (error) {
    logs.push({ type: 'error', text: error.message, timestamp: new Date().toISOString() })
    fs.writeFileSync('tests/invite_settings_logs.json', JSON.stringify({ status: 'failed', error: error.message, logs }, null, 2))
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

testPages()
