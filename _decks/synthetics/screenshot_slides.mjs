import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const deckUrl = new URL('./index.html', import.meta.url);
const outDir = path.join(here, 'slide-screenshots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(deckUrl.href, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const deck = document.querySelector('deck-stage');
    return deck && typeof deck.goTo === 'function' && deck.length > 0;
  });
  await page.waitForTimeout(300);

  const totalSlides = await page.locator('deck-stage > section').count();

  for (let i = 0; i < totalSlides; i++) {
    await page.locator('deck-stage').evaluate((deck, index) => deck.goTo(index), i);
    await page.waitForTimeout(300);

    const file = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: file, type: 'png' });
    console.log(`slide ${i + 1} -> ${path.basename(file)}`);
  }
} finally {
  await browser.close();
}
