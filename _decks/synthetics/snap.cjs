const {chromium} = require('./node_modules/playwright');
const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
const deckUrl = pathToFileURL(path.join(__dirname, 'index.html')).href;
const outDir = path.join(__dirname, 'slide-screenshots');
fs.mkdirSync(outDir, {recursive: true});
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({width: 1920, height: 1080});
  await page.goto(deckUrl, {waitUntil: 'networkidle'});
  await page.waitForTimeout(1500);
  for (let i = 0; i < 6; i++) {
    await page.evaluate((n) => document.querySelector('deck-stage').goTo(n), i);
    await page.waitForTimeout(400);
    const f = path.join(outDir, 'slide-' + String(i+1).padStart(2,'0') + '.png');
    await page.screenshot({path: f, type: 'png'});
    console.log('slide', i+1);
  }
  await browser.close();
  console.log('Done.');
})().catch(e => { console.error(e); process.exit(1); });
