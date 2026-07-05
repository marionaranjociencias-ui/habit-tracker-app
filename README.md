# Habit Tracker App (Fase 3)

App unificada: hábitos **Sí/No** y **numéricos** con columna de unidades. Login obligatorio con Google y datos sincronizados en Firestore.

## Características

- Login con Google (Firebase Auth)
- Lagartijas / Pull-ups → números + unidad `reps`
- Meditar / Agua → checkbox ✓
- Dashboard gamificado, Excel export
- **Datos en Firestore por usuario** — sincronización entre dispositivos

## Configuración Firebase (obligatoria)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Registra una app **Web** y copia las credenciales
3. **Authentication → Sign-in method → Google → Habilitar**
4. **Authentication → Settings → Authorized domains** → añade `localhost` y tu dominio Vercel
5. Copia `.env.example` → `.env.local` y rellena las 6 variables `VITE_FIREBASE_*`
6. En **Vercel → Settings → Environment Variables**, añade las mismas 6 variables y redeploy

## Configuración Firestore (Fase 3)

Ver guía detallada: [`FIRESTORE-SETUP.md`](./FIRESTORE-SETUP.md)

1. Firebase Console → **Firestore Database** → Create database
2. Publicar reglas de [`firestore.rules`](./firestore.rules)
3. No se requieren variables de entorno adicionales en Vercel

## Uso local

```powershell
cd "C:\Root\CURSOR\Proyectos\habit-tracker-app"
npm install
npm run dev
```

Abre **http://localhost:5175** e inicia sesión con Google.

## Publicar en internet (Vercel)

1. [vercel.com/new](https://vercel.com/new) → Import `marionaranjociencias-ui/habit-tracker-app`
2. **Production Branch:** `main`
3. Build: `npm run build` · Output: `dist`
4. Añadir variables de entorno Firebase (ver arriba)
5. Deploy

URL producción: https://habit-tracker-app-7z5d.vercel.app

## Roadmap

| Fase | Estado |
|------|--------|
| 1 — App unificada + Vercel | Completada |
| 2 — Login Gmail (Firebase Auth) | Completada |
| 3 — Datos en la nube (Firestore) | Completada |

## Proyectos anteriores (sin cambios)

- `habit-tracker-saiyan` — solo checkboxes (5173)
- `habit-tracker-numerico` — solo números (5174)

Este proyecto (`habit-tracker-app`) es la app final con login y sincronización en la nube.
