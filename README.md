# Habit Tracker App (Fase 1)

App unificada: hábitos **Sí/No** y **numéricos** con columna de unidades. Preparada para publicarse en Vercel.

> **Rama GitHub:** `unificado` (mismo repo que la versión simple, rama `main`)

## Características

- Lagartijas / Pull-ups → números + unidad `reps`
- Meditar / Agua → checkbox ✓
- Dashboard gamificado, Excel export, localStorage

## Uso local

```powershell
cd "C:\Root\CURSOR\Proyectos\habit-tracker-app"
npm install
npm run dev
```

Abre **http://localhost:5175**

## Publicar en internet (Vercel)

1. [vercel.com/new](https://vercel.com/new) → Import `marionaranjo-oss/habit-tracker-app`
2. **Production Branch:** `unificado`
3. Build: `npm run build` · Output: `dist`
4. Deploy

Guía detallada de las dos versiones: `../DOS-VERSIONES.md`

## Roadmap

| Fase | Estado |
|------|--------|
| 1 — App unificada + Vercel | En curso |
| 2 — Login Gmail (Firebase) | Pendiente |
| 3 — Datos en la nube | Pendiente |

## Proyectos anteriores (sin cambios)

- `habit-tracker-saiyan` — solo checkboxes (5173)
- `habit-tracker-numerico` — solo números (5174)

Este proyecto (`habit-tracker-app`) es la base para la app final.
