# Houshou Marine · Sub-Bot VIP

Página de embarque para la red de sub-bots de Houshou Marine. Conecta un número de WhatsApp como **Sub-Bot VIP** escaneando un QR, muestra la tripulación conectada en vivo y recoge las reseñas de la comunidad en una bitácora.

El rediseño parte de una idea sencilla: si el proyecto es una tripulación, la página debe sentirse como una **carta de embarque**. De ahí salen el compás de navegación, el sello del capitán, el manifiesto y la bitácora.

## Cómo está hecho

- HTML + CSS + JavaScript sin frameworks ni paso de compilación.
- Tipografía autoalojada: **Newsreader** para titulares y **Archivo** para interfaz.
- Ilustración vectorial propia (compás, ancla, líneas de carta) y sello circular con el retrato.
- Paleta de tinta marina, papel de carta náutica, rojo de señal y latón.
- Estados reales para cargando, vacío, error y conexión completada.
- Accesibilidad: navegación por teclado, foco visible, etiquetas, `aria-live` y respeto a `prefers-reduced-motion`.
- Sin imágenes externas ni dependencias de terceros en producción (las fuentes y el retrato se sirven desde `assets/`).

## Estructura

```
index.html                  Página completa
assets/css/main.css         Sistema visual, componentes y responsive
assets/js/app.js            Conexión QR, manifiesto y bitácora
assets/fonts/               Newsreader + Archivo (licencias OFL incluidas)
assets/img/                 Retrato, favicon y versión optimizada
dev/preview-server.mjs      Vista local con API simulada
vercel.json                 Proxy /api hacia el backend
```

## Ver en local

No hace falta instalar nada. El servidor de vista previa usa solo Node.

```bash
node dev/preview-server.mjs
# http://localhost:4173
```

El mock simula el flujo completo: genera un QR de prueba, marca la conexión como completada a los ~6 segundos, añade el número al manifiesto y permite publicar entradas en la bitácora.

Para ver la página con datos reales, sirve la carpeta con cualquier servidor estático y apunta las peticiones `/api` al backend (ver abajo).

## API esperada

Todas las rutas son relativas y las consume `assets/js/app.js`:

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/api/list` | `{ list: [{ name, number, vip, pic }] }` |
| `POST` | `/api/start` | `{ number }` → `{}` o `{ error }` |
| `GET` | `/api/qr?number=...` | `{ qr }` (data URL o URL de imagen) |
| `GET` | `/api/status?number=...` | `{ connected: boolean }` |
| `GET` | `/api/reviews` | `{ reviews: [{ name, date, message, reply }] }` |
| `POST` | `/api/reviews` | `{ name, message }` → `{}` |

`pic` puede ser una URL `http(s)`, una ruta local o un data URI; si falta, se usan las iniciales.

## Despliegue

El sitio es estático y está pensado para Vercel. `vercel.json` mantiene el proxy actual:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "http://64.20.54.50:25543/api/:path*" }
  ]
}
```

Si el backend cambia de host o de puerto, actualiza esa línea. No hay build que configurar: Vercel sirve `index.html` y la carpeta `assets/`.

## Créditos

- Houshou Marine pertenece a COVER Corp. Este es un proyecto de fans no oficial.
- Proyecto y soporte: DevsOpp.
- Tipografías: Archivo y Newsreader, bajo SIL Open Font License (archivos de licencia en `assets/fonts/`).
