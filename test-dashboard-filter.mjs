import { chromium } from 'playwright';

async function testDashboardFilter() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createContext();
  const page = await context.newPage();

  console.log('Navigating to Dashboard...');
  await page.goto('http://localhost:5178/maximus-estimus/', { waitUntil: 'networkidle' });

  // Wait for dashboard to load
  await page.waitForSelector('.stats-row', { timeout: 10000 });
  console.log('Dashboard loaded');

  // Take screenshot of initial state
  console.log('\n1️⃣ Initial state (no filter)');
  await page.screenshot({ path: 'test-01-initial.png' });
  console.log('✅ Screenshot: test-01-initial.png');

  // Click on "Draft" stat card
  console.log('\n2️⃣ Clicking "Draft" stat card...');
  const draftCard = page.locator('.stat-card').nth(1);
  await draftCard.click();
  await page.waitForTimeout(500);

  // Check if stat-card-active class is applied
  const isDraftActive = await draftCard.evaluate(el =>
    el.classList.contains('stat-card-active')
  );
  console.log(`Draft card has stat-card-active class: ${isDraftActive}`);

  // Take screenshot
  await page.screenshot({ path: 'test-02-draft-filtered.png' });
  console.log('✅ Screenshot: test-02-draft-filtered.png');

  // Click again to reset
  console.log('\n3️⃣ Clicking "Draft" stat card again to reset...');
  await draftCard.click();
  await page.waitForTimeout(500);

  const isDraftStillActive = await draftCard.evaluate(el =>
    el.classList.contains('stat-card-active')
  );
  console.log(`Draft card has stat-card-active class after reset: ${isDraftStillActive}`);

  // Take screenshot
  await page.screenshot({ path: 'test-03-reset.png' });
  console.log('✅ Screenshot: test-03-reset.png');

  // Test "Total" card
  console.log('\n4️⃣ Clicking "Total" stat card...');
  const totalCard = page.locator('.stat-card').nth(0);
  await totalCard.click();
  await page.waitForTimeout(500);

  const isTotalActive = await totalCard.evaluate(el =>
    el.classList.contains('stat-card-active')
  );
  console.log(`Total card has stat-card-active class: ${isTotalActive}`);

  await page.screenshot({ path: 'test-04-total-filtered.png' });
  console.log('✅ Screenshot: test-04-total-filtered.png');

  console.log('\n✅ All tests completed!');

  await browser.close();
}

testDashboardFilter().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
