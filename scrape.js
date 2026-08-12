// Robot que abre la página de alertas del SMN como un navegador real,
// espera a que la app guarde su token (JWT anónimo, dura ~1 h) y lo deja
// en token.json para que el Panel Gaman lo lea. Corre en GitHub Actions.
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'es-AR',
    viewport: { width: 1366, height: 768 },
  });
  const page = await ctx.newPage();

  try {
    await page.goto('https://ws2.smn.gob.ar/alertas', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    console.error('No se pudo cargar la página del SMN:', e.message);
    await browser.close();
    process.exit(1);
  }

  // Espera hasta ~40 s a que la app guarde el token en localStorage.
  let token = null;
  for (let i = 0; i < 40; i++) {
    token = await page.evaluate(() => { try { return localStorage.getItem('token'); } catch (e) { return null; } });
    if (token) break;
    await page.waitForTimeout(1000);
  }
  await browser.close();

  if (!token) {
    console.error('No se obtuvo el token (Cloudflare pudo haber bloqueado a GitHub).');
    process.exit(1);
  }

  fs.writeFileSync('token.json', JSON.stringify({ token: token, ts: Date.now() }));
  console.log('OK: token guardado en token.json (' + token.slice(0, 18) + '…)');
})();
