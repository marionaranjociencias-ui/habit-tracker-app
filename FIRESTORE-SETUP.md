# Configurar Firestore

Guía para habilitar la sincronización de hábitos en la nube.

## Requisitos previos

- Proyecto Firebase `habit-tracker-unificad` con Auth y Google habilitados
- Variables `VITE_FIREBASE_*` configuradas en Vercel y/o `.env.local`

## Paso 1 — Crear base de datos Firestore

1. Abre [Firebase Console](https://console.firebase.google.com/project/habit-tracker-unificad)
2. Menú izquierdo → **Firestore Database**
3. Clic en **Create database**
4. Modo: **Production** (recomendado)
5. Región: la más cercana (ej. `northamerica-south1`)
6. **Create**

## Paso 2 — Publicar reglas de seguridad

1. En Firestore → pestaña **Rules**
2. Copia el contenido de [`firestore.rules`](./firestore.rules) del repositorio
3. Pega en el editor de reglas
4. Clic en **Publish**

Las reglas garantizan que cada usuario solo lee y escribe sus propios datos en:

- `users/{userId}/settings`
- `users/{userId}/habits/{habitId}`
- `users/{userId}/habits/{habitId}/logs/{dateKey}`

## Paso 3 — Verificar en la app

1. Abre https://habit-tracker-app-7z5d.vercel.app (o `npm run dev` en local)
2. Inicia sesión con Google
3. Crea un hábito en modo simple o con unidades
4. Registra un día en el grid
5. Abre la app en **otro dispositivo** con la misma cuenta
6. Los datos deben aparecer sincronizados

## Estructura de datos en Firestore

```
users/
  {userId}/
    settings/
      categories: [...]
      updatedAt: "..."
    habits/
      {habitId}/
        id, name, categoryId, order
        trackingMode: "simple" | "units"
        unitLabel?, targetValue?, targetPeriod
        createdAt, updatedAt
        logs/
          {YYYY-MM-DD}/
            date, completed, value?, updatedAt
```

Los hábitos son **persistentes** (no se duplican por mes). La vista mensual filtra los logs por rango de fechas.

## Nota sobre datos antiguos

La arquitectura anterior usaba `users/{userId}/months/{YYYY-MM}`. Esa ruta ya no se utiliza. Puedes borrar esos documentos manualmente en Firebase Console si lo deseas.

## No se requieren variables nuevas en Vercel

Firestore usa las mismas credenciales Firebase ya configuradas (`VITE_FIREBASE_PROJECT_ID`, etc.).

## Despliegue

Tras cambios en el código:

```powershell
cd "C:\Root\CURSOR\Proyectos\habit-tracker-app"
npm run build
git add .
git commit -m "Refactor: hábitos persistentes con logs diarios"
git push origin main
```

Vercel redeploy automático si el repo está conectado.

## Solución de problemas

| Error | Causa | Solución |
|---|---|---|
| `permission-denied` | Reglas no publicadas o usuario no autenticado | Publicar `firestore.rules` y verificar login |
| Datos no aparecen en otro dispositivo | Firestore no creado o reglas incorrectas | Completar pasos 1 y 2 |
| `No se pudieron cargar tus hábitos` | Sin conexión o Firestore no habilitado | Revisar red y Firebase Console |
