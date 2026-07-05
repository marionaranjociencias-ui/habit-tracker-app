# Fase 1 — Publicar en Vercel

Esta guía lleva la app a internet con una URL pública (sin login aún).

## Requisitos

- Cuenta en [GitHub](https://github.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis, puedes entrar con GitHub)

## Paso 1 — Probar build en tu PC

```powershell
cd "C:\Root\CURSOR\Proyectos\habit-tracker-app"
npm install
npm run build
```

Si termina sin errores, la carpeta `dist/` está lista para publicar.

Prueba local del build:

```powershell
npm run preview
```

## Paso 2 — Subir código a GitHub

1. Crea un repositorio nuevo en GitHub (ej. `habit-tracker-app`)
2. En la carpeta del proyecto:

```powershell
git init
git add .
git commit -m "Fase 1: app unificada lista para Vercel"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/habit-tracker-app.git
git push -u origin main
```

**No subas** `node_modules` ni `.env` (ya están en `.gitignore`).

## Paso 3 — Conectar Vercel

1. Entra a [vercel.com/new](https://vercel.com/new)
2. **Import** tu repositorio de GitHub
3. Vercel detecta Vite automáticamente:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Clic en **Deploy**

En 1–2 minutos tendrás una URL como:

`https://habit-tracker-app.vercel.app`

## Paso 4 — Usar la app publicada

- Abre la URL desde cualquier dispositivo
- Los datos se guardan en el **navegador de ese dispositivo** (igual que en local)
- Cada despliegue nuevo en Vercel actualiza la app automáticamente

## Notas sobre Drive

- Sincroniza el **código**, no `node_modules`
- En cada PC: `npm install` solo si desarrollas localmente
- Vercel instala dependencias en la nube al desplegar

## Siguiente fase

Fase 2: Firebase + **Continuar con Google** para que tus datos sigan tu cuenta Gmail.
