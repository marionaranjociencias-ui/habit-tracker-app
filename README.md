# Habit Tracker App (Fase 2)

App unificada: hábitos **Sí/No** y **numéricos** con columna de unidades. Login obligatorio con Google.

> **Rama GitHub:** `unificado` (mismo repo que la versión simple, rama `main`)

## Características

- Login con Google (Firebase Auth)
- Lagartijas / Pull-ups → números + unidad `reps`
- Meditar / Agua → checkbox ✓
- Dashboard gamificado, Excel export
- Datos en localStorage **por usuario** (preparado para Fase 3 en la nube)

## Configuración Firebase (obligatoria)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Registra una app **Web** y copia las credenciales
3. **Authentication → Sign-in method → Google → Habilitar**
4. **Authentication → Settings → Authorized domains** → añade `localhost` y tu dominio Vercel
5. Copia `.env.example` → `.env.local` y rellena las 6 variables `VITE_FIREBASE_*`
6. En **Vercel → Settings → Environment Variables**, añade las mismas 6 variables y redeploy

## Uso local

```powershell
cd "C:\Root\CURSOR\Proyectos\habit-tracker-app"
npm install
npm run dev
```

Abre **http://localhost:5175** e inicia sesión con Google.

## Publicar en internet (Vercel)

1. [vercel.com/new](https://vercel.com/new) → Import `marionaranjo-oss/habit-tracker-app`
2. **Production Branch:** `unificado`
3. Build: `npm run build` · Output: `dist`
4. Añadir variables de entorno Firebase (ver arriba)
5. Deploy

Guía detallada de las dos versiones: `../DOS-VERSIONES.md`

## Roadmap

| Fase | Estado |
|------|--------|
| 1 — App unificada + Vercel | Completada |
| 2 — Login Gmail (Firebase) | Completada |
| 3 — Datos en la nube (Firestore) | Pendiente |

## Proyectos anteriores (sin cambios)

- `habit-tracker-saiyan` — solo checkboxes (5173), rama `main`
- `habit-tracker-numerico` — solo números (5174)

Este proyecto (`habit-tracker-app`) es la base para la app final.
