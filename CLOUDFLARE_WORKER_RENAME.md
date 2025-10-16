# 🚨 ACCIÓN URGENTE - Configurar Cloudflare Pages

## ❌ Problema Actual
Tu sitio está intentando conectarse a:
```
https://jetchance-api.workers.dev/api
```

Pero tu Worker en Cloudflare se llama:
```
chancefly-api  ← Nombre actual en Cloudflare
```

## ✅ Solución (2 Opciones)

---

### Opción 1: Renombrar Worker en Cloudflare (RECOMENDADO) 🎯

#### Paso 1: Deploy el Worker con nuevo nombre

```bash
# En tu terminal
cd workers/jetchance-api

# Deploy con el nuevo nombre
npm run deploy
# o
npx wrangler deploy
```

Esto creará un nuevo Worker llamado **`jetchance-api`** en Cloudflare.

#### Paso 2: Configurar Variable en Cloudflare Pages

1. Ve a: https://dash.cloudflare.com
2. **Pages** → **chancefly-frontend** (o como se llame tu proyecto Pages)
3. **Settings** → **Environment variables**
4. **Production** section → **Add variable**:
   ```
   Variable name: VITE_API_URL
   Value: https://jetchance-api.workers.dev/api
   ```
5. Click **Save**

#### Paso 3: Redeploy el Frontend

```bash
# Opción A: Trigger desde dashboard
# Cloudflare Pages → Deployments → Latest → Retry deployment

# Opción B: Push a main
git add .
git commit -m "fix: rename worker from chancefly to jetchance"
git push origin main
```

#### Paso 4: Verificar

1. Espera ~2 minutos para que termine el deployment
2. Ve a tu sitio: `https://chancefly-frontend.pages.dev`
3. Intenta registrarte
4. Debería funcionar ✅

---

### Opción 2: Cambiar URLs a chancefly (NO Recomendado)

Si prefieres mantener `chancefly` en Cloudflare:

```bash
# 1. Renombrar carpeta de vuelta
mv workers/jetchance-api workers/chancefly-api

# 2. Actualizar .env.production
# Cambiar: https://jetchance-api.workers.dev/api
# A:      https://chancefly-api.workers.dev/api

# 3. Deploy
```

**No recomiendo esta opción** porque ya has hecho muchos cambios a jetchance.

---

## 🎯 Mi Recomendación: Opción 1

### Comandos Exactos a Ejecutar:

```bash
# 1. Deploy nuevo worker
cd workers/jetchance-api
npm run deploy

# Resultado esperado:
# ✨ Success! Uploaded jetchance-api
# 🌐 https://jetchance-api.workers.dev
```

Luego en Cloudflare Dashboard:

1. **Pages** → Tu proyecto
2. **Settings** → **Environment variables**
3. Add: `VITE_API_URL` = `https://jetchance-api.workers.dev/api`
4. **Retry deployment**

### Tiempo Total: ~5 minutos

---

## 🔍 Verificar Estado Actual

### Ver qué Workers tienes:
```bash
cd workers/jetchance-api
npx wrangler whoami
npx wrangler deployments list
```

### Ver qué Pages projects tienes:
Ve a: https://dash.cloudflare.com → Pages

---

## ✅ Checklist Final

Después de completar Opción 1:

- [ ] Worker `jetchance-api` desplegado en Cloudflare
- [ ] Variable `VITE_API_URL` configurada en Cloudflare Pages
- [ ] Frontend redeployado (retry deployment o push a main)
- [ ] Registro de usuarios funciona sin errores
- [ ] No más `ERR_NAME_NOT_RESOLVED` en consola
- [ ] URL correcta visible en Network tab: `jetchance-api.workers.dev`

---

## 🆘 Si Algo Falla

### Error: "Worker ya existe"
Ya tienes `jetchance-api` en Cloudflare → Solo configura la variable

### Error: "Permission denied"
```bash
npx wrangler login
npx wrangler deploy
```

### Error: "Database not found"
Tu D1 database está bien configurada en wrangler.jsonc, no toques nada

---

## 📱 ¿Listo para Proceder?

**Ejecuta estos comandos AHORA:**

```bash
cd workers/jetchance-api
npm run deploy
```

Luego dime qué mensaje te sale y te ayudo con el siguiente paso.
