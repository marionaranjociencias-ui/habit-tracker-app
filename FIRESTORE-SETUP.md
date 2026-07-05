# Fase 3 — Configurar Firestore

Guía para habilitar la sincronización de hábitos en la nube.

## Requisitos previos

- Proyecto Firebase `habit-tracker-unificad` con Auth y Google habilitados
- Variables `VITE_FIREBASE_*` configuradas en Vercel y/o `.env.local`

## Paso 1 — Crear base de datos Firestore

1. Abre [Firebase Console](https://console.firebase.google.com/project/habit-tracker-unificad)
2. Menú izquierdo → **Firestore Database**
3. Clic en **Create database**
4. Modo: **Production** (recomendado)
5. Región: la más cercana (ej. `us-central1`) — no se puede cambiar después
6. **Create**

## Paso 2 — Publicar reglas de seguridad

1. En Firestore → pestaña **Rules**
2. Copia el contenido de [`firestore.rules`](./firestore.rules) del repositorio
3. Pega en el editor de reglas
4. Clic en **Publish**

Las reglas garantizan que cada usuario solo lee y escribe sus propios datos en `users/{userId}/months/{monthId}` y `users/{userId}/settings`.

## Paso 3 — Verificar en la app

1. Abre https://habit-tracker-app-7z5d.vercel.app (o `npm run dev` en local)
2. Inicia sesión con Google
3. Registra un hábito (ej. 60 lagartijas)
4. Abre la app en **otro dispositivo** con la misma cuenta
5. Los datos deben aparecer sincronizados

## Migración desde localStorage

Si ya tenías datos guardados en el navegador (Fase 2), la app los sube automáticamente a Firestore en el primer acceso tras la Fase 3. No hace falta hacer nada manual.

## Estructura de datos en Firestore

```
users/
  {userId}/
    settings/
      categories: [...]
      updatedAt: "..."
    months/
      2026-07/          ← año-mes
        year: 2026
        month: 6         ← 0-indexed (julio)
        habits: [...]    ← cada hábito incluye categoryId
        updatedAt: "..."
```

## No se requieren variables nuevas en Vercel

Firestore usa las mismas credenciales Firebase ya configuradas (`VITE_FIREBASE_PROJECT_ID`, etc.).

## Despliegue

Tras cambios en el código:

```powershell
cd "C:\Root\CURSOR\Proyectos\habit-tracker-app"
npm run build
git add .
git commit -m "Fase 3: sincronizar hábitos en Firestore"
git push origin main
```

Vercel redeploy automático si el repo está conectado.

## Solución de problemas

| Error | Causa | Solución |
|---|---|---|
| `permission-denied` | Reglas no publicadas o usuario no autenticado | Publicar `firestore.rules` y verificar login |
| Datos no aparecen en otro dispositivo | Firestore no creado o reglas incorrectas | Completar pasos 1 y 2 |
| `No se pudieron cargar tus hábitos` | Sin conexión o Firestore no habilitado | Revisar red y Firebase Console |
