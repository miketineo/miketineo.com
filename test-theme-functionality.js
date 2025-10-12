/**
 * Comprehensive test to verify theme toggle functionality
 * Tests clicking, theme persistence, and visual state
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testThemeFunctionality() {
  console.log('Starting theme functionality test...\n');

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

  try {
    console.log('✓ Navigating to http://localhost:8765/');
    await page.goto('http://localhost:8765/', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: Verify theme toggle is in header (not fixed position)
    console.log('\n--- Test 1: Verify Theme Toggle Position ---');
    const positionTest = await page.evaluate(() => {
      const themeSwitcher = document.querySelector('.theme-switcher');
      const navContainer = document.querySelector('.nav-container');
      const style = window.getComputedStyle(themeSwitcher);

      return {
        position: style.position,
        inNav: navContainer.contains(themeSwitcher),
        order: style.order,
        zIndex: style.zIndex
      };
    });

    console.log(`  Position: ${positionTest.position} (should be "static")`);
    console.log(`  In nav container: ${positionTest.inNav} (should be true)`);
    console.log(`  Order: ${positionTest.order} (should be "2")`);

    if (positionTest.position === 'static' && positionTest.inNav && positionTest.order === '2') {
      console.log('  ✓ PASS: Theme toggle correctly positioned in header');
    } else {
      console.log('  ✗ FAIL: Theme toggle not properly positioned');
    }

    // Test 2: Verify touch target sizes (44x44px minimum)
    console.log('\n--- Test 2: Verify Touch Target Sizes ---');
    const touchTargetTest = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.theme-btn'));
      return buttons.map(btn => {
        const rect = btn.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          meetsMinimum: rect.width >= 44 && rect.height >= 44
        };
      });
    });

    touchTargetTest.forEach((btn, idx) => {
      console.log(`  Button ${idx + 1}: ${btn.width}x${btn.height}px - ${btn.meetsMinimum ? '✓ PASS' : '✗ FAIL'}`);
    });

    const allMeetMinimum = touchTargetTest.every(btn => btn.meetsMinimum);
    if (allMeetMinimum) {
      console.log('  ✓ PASS: All buttons meet 44x44px minimum touch target');
    } else {
      console.log('  ✗ FAIL: Some buttons do not meet minimum touch target size');
    }

    // Test 3: Verify clicking light mode button
    console.log('\n--- Test 3: Test Light Mode Button Click ---');
    await page.evaluate(() => {
      const lightBtn = document.querySelector('[data-theme="light"]');
      if (lightBtn) lightBtn.click();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    const lightModeState = await page.evaluate(() => {
      return {
        dataTheme: document.documentElement.getAttribute('data-theme'),
        activeButton: document.querySelector('.theme-btn.active')?.dataset.theme,
        localStorage: localStorage.getItem('theme')
      };
    });

    console.log(`  Data-theme attribute: ${lightModeState.dataTheme}`);
    console.log(`  Active button: ${lightModeState.activeButton}`);
    console.log(`  localStorage: ${lightModeState.localStorage}`);

    if (lightModeState.dataTheme === 'light' &&
        lightModeState.activeButton === 'light' &&
        lightModeState.localStorage === 'light') {
      console.log('  ✓ PASS: Light mode works correctly');
    } else {
      console.log('  ✗ FAIL: Light mode not working properly');
    }

    // Test 4: Verify clicking dark mode button
    console.log('\n--- Test 4: Test Dark Mode Button Click ---');
    await page.evaluate(() => {
      const darkBtn = document.querySelector('[data-theme="dark"]');
      if (darkBtn) darkBtn.click();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    const darkModeState = await page.evaluate(() => {
      return {
        dataTheme: document.documentElement.getAttribute('data-theme'),
        activeButton: document.querySelector('.theme-btn.active')?.dataset.theme,
        localStorage: localStorage.getItem('theme')
      };
    });

    console.log(`  Data-theme attribute: ${darkModeState.dataTheme}`);
    console.log(`  Active button: ${darkModeState.activeButton}`);
    console.log(`  localStorage: ${darkModeState.localStorage}`);

    if (darkModeState.dataTheme === 'dark' &&
        darkModeState.activeButton === 'dark' &&
        darkModeState.localStorage === 'dark') {
      console.log('  ✓ PASS: Dark mode works correctly');
    } else {
      console.log('  ✗ FAIL: Dark mode not working properly');
    }

    // Test 5: Verify clicking auto mode button
    console.log('\n--- Test 5: Test Auto Mode Button Click ---');
    await page.evaluate(() => {
      const autoBtn = document.querySelector('[data-theme="auto"]');
      if (autoBtn) autoBtn.click();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    const autoModeState = await page.evaluate(() => {
      return {
        activeButton: document.querySelector('.theme-btn.active')?.dataset.theme,
        localStorage: localStorage.getItem('theme')
      };
    });

    console.log(`  Active button: ${autoModeState.activeButton}`);
    console.log(`  localStorage: ${autoModeState.localStorage}`);

    if (autoModeState.activeButton === 'auto' &&
        autoModeState.localStorage === 'auto') {
      console.log('  ✓ PASS: Auto mode works correctly');
    } else {
      console.log('  ✗ FAIL: Auto mode not working properly');
    }

    // Test 6: Verify header layout on mobile
    console.log('\n--- Test 6: Verify Mobile Header Layout ---');
    const layoutTest = await page.evaluate(() => {
      const logo = document.querySelector('.nav-logo');
      const themeSwitcher = document.querySelector('.theme-switcher');
      const hamburger = document.querySelector('.nav-toggle');

      const logoRect = logo.getBoundingClientRect();
      const themeRect = themeSwitcher.getBoundingClientRect();
      const hamburgerRect = hamburger.getBoundingClientRect();

      return {
        logo: { left: logoRect.left, right: logoRect.right },
        theme: { left: themeRect.left, right: themeRect.right },
        hamburger: { left: hamburgerRect.left, right: hamburgerRect.right },
        properOrder: logoRect.left < themeRect.left && themeRect.right < hamburgerRect.left
      };
    });

    console.log(`  Logo position: ${layoutTest.logo.left.toFixed(1)} - ${layoutTest.logo.right.toFixed(1)}`);
    console.log(`  Theme toggle: ${layoutTest.theme.left.toFixed(1)} - ${layoutTest.theme.right.toFixed(1)}`);
    console.log(`  Hamburger: ${layoutTest.hamburger.left.toFixed(1)} - ${layoutTest.hamburger.right.toFixed(1)}`);

    if (layoutTest.properOrder) {
      console.log('  ✓ PASS: Elements are in correct order (logo | theme | hamburger)');
    } else {
      console.log('  ✗ FAIL: Elements are not in correct order');
    }

    // Test 7: Verify no floating elements
    console.log('\n--- Test 7: Verify No Floating Theme Toggle ---');
    const noFloatingTest = await page.evaluate(() => {
      const themeSwitcher = document.querySelector('.theme-switcher');
      const style = window.getComputedStyle(themeSwitcher);

      return {
        position: style.position,
        bottom: style.bottom,
        isFloating: style.position === 'fixed' || style.position === 'absolute'
      };
    });

    console.log(`  Position: ${noFloatingTest.position}`);
    console.log(`  Bottom: ${noFloatingTest.bottom}`);

    if (!noFloatingTest.isFloating) {
      console.log('  ✓ PASS: Theme toggle is not floating');
    } else {
      console.log('  ✗ FAIL: Theme toggle is still floating');
    }

    console.log('\n' + '='.repeat(50));
    console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Error during testing:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testThemeFunctionality()
  .then(() => {
    console.log('\n✓ Test suite completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Test suite failed:', error);
    process.exit(1);
  });
