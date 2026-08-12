# SMN token — robot para el Panel Gaman

Obtiene cada 30 minutos el token del Servicio Meteorológico Nacional (que ahora está
detrás de Cloudflare) y lo deja en `token.json`. El Panel Gaman lo lee desde la URL
"raw" de este repo y así puede volver a mostrar las alertas.

## Puesta en marcha (una vez)

1. Creá un repositorio **público** en GitHub llamado, por ejemplo, `smn-token`.
2. Subí estos archivos tal cual (respetando las carpetas):
   - `scrape.js`
   - `package.json`
   - `token.json`
   - `.github/workflows/smn.yml`
3. En el repo: pestaña **Actions** → si pide habilitarlas, **Enable**. Después abrí
   el workflow **"SMN token"** → **Run workflow** para probarlo una vez.
4. Cuando termine (tilde verde), revisá que `token.json` tenga un token largo.
5. La URL "raw" de tu token queda así (reemplazá TU_USUARIO):
   `https://raw.githubusercontent.com/TU_USUARIO/smn-token/main/token.json`
6. En el Panel Gaman (proyecto v2), andá a **Configuración del proyecto → Propiedades
   de la secuencia de comandos** y agregá:
   - Propiedad: `SMN_TOKEN_URL`
   - Valor: la URL raw del punto 5.

Listo. De ahí en más corre solo cada 30 min y el panel toma el token automáticamente.

> Nota: el SMN bloquea accesos automáticos a propósito. Si algún día vuelve a fallar,
> es porque endurecieron el Cloudflare; habría que ajustar el robot.
