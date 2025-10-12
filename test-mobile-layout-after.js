/**
 * Puppeteer test script to capture mobile layout screenshots AFTER fix
 * Tests the theme toggle positioning on mobile viewports
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureMobileScreenshots() {
  console.log('Starting Puppeteer...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set mobile viewport (iPhone SE dimensions)
  await page.setViewport({
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  try {
    console.log('Navigating to http://localhost:8765/');
    await page.goto('http://localhost:8765/', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    // Wait a moment for any animations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture light mode
    console.log('Capturing light mode screenshot...');
    await page.screenshot({
      path: path.join(screenshotsDir, 'mobile-light-mode-after.png'),
      fullPage: false
    });

    // Switch to dark mode
    console.log('Switching to dark mode...');
    await page.evaluate(() => {
      const darkBtn = document.querySelector('[data-theme="dark"]');
      if (darkBtn) darkBtn.click();
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture dark mode
    console.log('Capturing dark mode screenshot...');
    await page.screenshot({
      path: path.join(screenshotsDir, 'mobile-dark-mode-after.png'),
      fullPage: false
    });

    // Capture header close-up in light mode
    await page.evaluate(() => {
      const lightBtn = document.querySelector('[data-theme="light"]');
      if (lightBtn) lightBtn.click();
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const headerElement = await page.$('.nav');
    if (headerElement) {
      console.log('Capturing header close-up...');
      await headerElement.screenshot({
        path: path.join(screenshotsDir, 'mobile-header-closeup-after.png')
      });
    }

    // Get theme toggle position info
    const themeToggleInfo = await page.evaluate(() => {
      const themeSwitcher = document.querySelector('.theme-switcher');
      if (!themeSwitcher) return null;

      const rect = themeSwitcher.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(themeSwitcher);

      // Check nav-container layout
      const navContainer = document.querySelector('.nav-container');
      const navContainerStyle = window.getComputedStyle(navContainer);

      return {
        themeSwitcher: {
          position: computedStyle.position,
          order: computedStyle.order,
          marginLeft: computedStyle.marginLeft,
          marginRight: computedStyle.marginRight,
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          zIndex: computedStyle.zIndex
        },
        navContainer: {
          display: navContainerStyle.display,
          justifyContent: navContainerStyle.justifyContent
        },
        buttons: Array.from(document.querySelectorAll('.theme-btn')).map(btn => {
          const btnRect = btn.getBoundingClientRect();
          const btnStyle = window.getComputedStyle(btn);
          return {
            width: btnRect.width,
            height: btnRect.height,
            minWidth: btnStyle.minWidth,
            minHeight: btnStyle.minHeight,
            padding: btnStyle.padding
          };
        })
      };
    });

    console.log('\n--- Updated Theme Toggle Position Info ---');
    console.log(JSON.stringify(themeToggleInfo, null, 2));

    console.log('\n✓ Screenshots captured successfully!');
    console.log(`  → ${path.join(screenshotsDir, 'mobile-light-mode-after.png')}`);
    console.log(`  → ${path.join(screenshotsDir, 'mobile-dark-mode-after.png')}`);
    console.log(`  → ${path.join(screenshotsDir, 'mobile-header-closeup-after.png')}`);

  } catch (error) {
    console.error('Error capturing screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
captureMobileScreenshots()
  .then(() => {
    console.log('\n✓ Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  });
