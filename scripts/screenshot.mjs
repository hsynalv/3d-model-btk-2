// Geliştirme yardımcısı: çalışan dev sunucusundan ekran görüntüsü alır.
// Kullanım: node scripts/screenshot.mjs <çıktı.png> "<query>" [scrollY] [genişlik]x[yükseklik]
import { chromium } from 'playwright-core';

const [out = '.shots/shot.png', query = '', scroll = '0', size = '1440x900'] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);
const url = `http://127.0.0.1:5173/${query}`;

const browser = await chromium.launch({
  channel: 'msedge',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width, height } });
page.on('console', (m) => m.type() !== 'debug' && console.log(`[${m.type()}]`, m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
if (+scroll) {
  await page.evaluate((y) => window.scrollTo(0, y), +scroll);
}
await page.waitForTimeout(2500);
await page.screenshot({ path: out });
await browser.close();
console.log(`✓ ${out}`);
