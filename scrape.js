const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    viewport: { width: 1366, height: 768 },
    extraHTTPHeaders: { 'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8' },
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = window.chrome || { runtime: {} };
    Object.defineProperty(navigator, 'languages', { get: () => ['es-AR', 'es'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  });

  const page = await ctx.newPage();
  let status = 0, title = '';
  try {
    const resp = await page.goto('https://ws2.smn.gob.ar/alertas', { waitUntil: 'domcontentloaded', timeout: 90000 });
    status = resp ? resp.status() : 0;
  } catch (e) {
    console.error('goto error:', e.message);
  }

  let token = null;
  for (let i = 0; i < 45; i++) {
    try { title = await page.title(); } catch (e) {}
    try { token = await page.evaluate(() => { try { return localStorage.getItem('token'); } catch (e) { return null; } }); } catch (e) {}
    if (token) break;
    await page.waitForTimeout(2000);
  }

  let bodySnippet = '';
  try { bodySnippet = (await page.evaluate(() => document.body ? document.body.innerText.slice(0, 300) : '')).replace(/\s+/g, ' '); } catch (e) {}
  console.log('HTTP status:', status, '| title:', title);
  console.log('body (300):', bodySnippet);

  await browser.close();

  if (!token) {
    const esChallenge = /just a moment|attention required|verify you are human|cloudflare/i.test(title + ' ' + bodySnippet);
    console.error(esChallenge
      ? 'BLOQUEADO por Cloudflare (desafío de navegador). GitHub no sirve como runner para esto.'
      : 'No se obtuvo el token (la página cargó pero no apareció el token).');
    process.exit(1);
  }

  fs.writeFileSync('token.json', JSON.stringify({ token: token, ts: Date.now() }));
  console.log('OK: token guardado en token.json (' + token.slice(0, 18) + '…)');
})();
