# Houshou Marine · Sub-Bot VIP

Sitio estático para conectar un número de WhatsApp como **Sub-Bot VIP** de Houshou Marine. Genera un código QR, muestra los sub-bots conectados y recoge las opiniones de la comunidad.

## Estructura

```
index.html                  Página completa
assets/css/main.css         Estilos, componentes y responsive
assets/js/app.js            Conexión QR, lista de sub-bots y opiniones
assets/fonts/               Newsreader + Archivo (licencias OFL incluidas)
assets/img/                 Retrato y favicon
vercel.json                 Proxy /api hacia el backend
```

No hay frameworks, compilación ni dependencias: solo HTML, CSS y JavaScript.

## API

El cliente consume rutas relativas bajo `/api`:

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/api/list` | `{ list: [{ name, number, vip, pic }] }` |
| `POST` | `/api/start` | `{ number }` → `{}` o `{ error }` |
| `GET` | `/api/qr?number=...` | `{ qr }` |
| `GET` | `/api/status?number=...` | `{ connected: boolean }` |
| `GET` | `/api/reviews` | `{ reviews: [{ name, date, message, reply }] }` |
| `POST` | `/api/reviews` | `{ name, message }` → `{}` |

`pic` puede ser una URL `http(s)`, una ruta local o un data URI.

## Despliegue

Sube `index.html` y la carpeta `assets/` a cualquier hosting estático.

En Vercel, `vercel.json` mantiene el proxy de `/api`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "http://64.20.54.50:25543/api/:path*" }
  ]
}
```

Si el backend cambia de host o puerto, actualiza esa línea.

## Créditos

- Houshou Marine pertenece a COVER Corp. Proyecto de fans no oficial.
- Proyecto y soporte: DevsOpp.
- Tipografías Archivo y Newsreader bajo SIL Open Font License.
