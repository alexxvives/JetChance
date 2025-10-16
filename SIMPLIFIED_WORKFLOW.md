# 🚀 Workflow Simplificado - Solo Cloudflare Workers

## ✅ Lo que Acabamos de Arreglar

El error de "First name and last name required" ya está resuelto:
- ✅ Operadores: NO necesitan nombre/apellido
- ✅ Customers: SÍ necesitan nombre/apellido
- ✅ Worker redeployado con el fix

---

## 🎯 Nuevo Workflow - Solo Cloudflare

### Desarrollo Local

```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# → http://localhost:8000

# Terminal 2: Worker API (local)
cd workers/jetchance-api
npx wrangler dev --port 4000
# → http://localhost:4000
```

**Ventajas:**
- ✅ Mismo código en local y producción
- ✅ Testeas con D1 database real
- ✅ Testeas con R2 storage real
- ✅ No más bugs de sincronización

---

## 📝 Hacer Cambios

### 1. Frontend (React)
```bash
# Editas archivos en /frontend/src/
# Vite hace hot reload automático
# Ves cambios instantáneos en localhost:8000
```

### 2. Backend (Worker API)
```bash
# Editas archivos en /workers/jetchance-api/src/
# Wrangler hace hot reload automático
# Testeas llamadas API desde frontend
```

### 3. Commit y Deploy
```bash
# Cuando todo funcione en local:
git add .
git commit -m "feat: descripción del cambio"
git push origin main

# Frontend se redespliegará automáticamente en Cloudflare Pages
# Worker necesitas deployarlo manualmente:
cd workers/jetchance-api
npx wrangler deploy
```

---

## 🗂️ Estructura del Proyecto

```
JetChance/
├── frontend/              ← React + Vite
│   ├── src/
│   └── package.json
│
├── workers/
│   └── jetchance-api/    ← Cloudflare Worker (ESTE ES TU BACKEND)
│       ├── src/
│       │   ├── handlers/
│       │   └── index.ts
│       └── wrangler.jsonc
│
└── backend/              ← ⚠️ YA NO USAR (legacy)
    └── server.js         ← Ignorar este
```

---

## ⚙️ Variables de Entorno

### Local Development
`frontend/.env`:
```bash
VITE_API_URL=http://localhost:4000/api
```

### Production (Cloudflare Pages)
Configurado en dashboard:
```bash
VITE_API_URL=https://jetchance-api.alexxvives.workers.dev/api
```

---

## 🔄 Comandos Útiles

### Desarrollo Diario
```bash
# Levantar todo local
cd frontend && npm run dev
# En otra terminal:
cd workers/jetchance-api && npx wrangler dev --port 4000
```

### Deploy a Producción
```bash
# Frontend (automático con git push)
git push origin main

# Worker (manual)
cd workers/jetchance-api
npx wrangler deploy
```

### Ver Logs del Worker
```bash
cd workers/jetchance-api
npx wrangler tail
```

### Acceder a D1 Database
```bash
cd workers/jetchance-api
npx wrangler d1 execute jetchance-db --command "SELECT * FROM users LIMIT 5"
```

---

## 📊 URLs del Proyecto

### Local
```
Frontend: http://localhost:8000
Backend:  http://localhost:4000/api
```

### Production
```
Frontend: https://jetchance.com
          https://www.jetchance.com
Backend:  https://jetchance-api.alexxvives.workers.dev/api
```

---

## ❌ Lo que YA NO Debes Usar

```bash
# ❌ NO ejecutar más:
cd backend
node server.js

# ❌ NO editar más:
backend/routes/*.js
backend/server.js
```

Esos archivos son legacy. Todo tu desarrollo ahora es en:
- `frontend/` → React
- `workers/jetchance-api/` → Backend API

---

## 🐛 Debugging

### Ver errores del Worker en producción
1. Cloudflare Dashboard → Workers & Pages
2. Click en `jetchance` (worker)
3. Tab **"Logs"** → **"Begin log stream"**
4. Haz requests desde tu sitio
5. Ves errores en tiempo real

### Ver qué está en D1 database
```bash
cd workers/jetchance-api
npx wrangler d1 execute jetchance-db --command "SELECT * FROM users"
npx wrangler d1 execute jetchance-db --command "SELECT * FROM operators"
```

---

## 🎯 Próximos Pasos

1. ✅ Worker ya está arreglado y deployado
2. ✅ Puedes registrar operadores en jetchance.com
3. 🔄 Para desarrollo futuro:
   - Usa `npx wrangler dev` en lugar de `node server.js`
   - Edita archivos en `workers/jetchance-api/src/`
   - Deploy con `npx wrangler deploy`

---

## 💡 Resumen

**Antes (Complicado):**
```
Local: Node.js backend (puerto 4000)
Producción: Cloudflare Workers
→ 2 códigos diferentes, bugs de sincronización
```

**Ahora (Simple):**
```
Local: Cloudflare Workers local (puerto 4000)
Producción: Cloudflare Workers
→ 1 código, mismo comportamiento
```

---

## 🚀 Empezar Ahora

```bash
# 1. Cierra el backend de Node.js si está corriendo
# 2. Levanta el Worker local:
cd workers/jetchance-api
npx wrangler dev --port 4000

# 3. En otra terminal, levanta frontend:
cd frontend
npm run dev

# 4. Testea en http://localhost:8000
# 5. Cuando funcione → commit y deploy
```

¡Listo! Ahora solo tienes 1 backend que mantener. 🎉
