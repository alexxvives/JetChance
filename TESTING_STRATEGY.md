# 🧪 Testing Strategy - Develop vs Main

## 📊 Estado Actual

### Branches en GitHub:
- `main` → Producción (Cloudflare Pages deployará aquí)
- `develop` → Testing (tú estás aquí ahora)

### URLs de Deployment:

#### Producción (main):
```
https://jetchance.alexxvives.workers.dev
```
- Deploy automático cuando pushes a `main`
- Esta es tu versión LIVE que los usuarios ven

#### Preview (develop y features):
```
https://[commit-hash].jetchance.pages.dev
```
- Cloudflare crea automáticamente previews para branches
- Cada push a `develop` genera nueva preview URL

---

## 🔄 Workflow Recomendado

### 1. Desarrollo Local
```bash
# Trabajar en develop
git checkout develop

# Testing local
cd backend
node server.js  # Terminal 1: http://localhost:4000

cd ../frontend  
npm run dev     # Terminal 2: http://localhost:8000
```

**Testea en**: `http://localhost:8000`
- ✅ Rápido
- ✅ Gratis
- ✅ Ver cambios en tiempo real
- ⚠️ Base de datos local (SQLite)
- ⚠️ No testea con Cloudflare Workers API

---

### 2. Preview Deployment (Opcional pero Recomendado)
```bash
# Push a develop
git push origin develop

# Cloudflare automáticamente:
# 1. Detecta el push
# 2. Buildea el proyecto  
# 3. Crea URL de preview
```

**Testea en**: `https://[hash].jetchance.pages.dev`

**Cómo encontrar la URL**:
1. Ve a: https://dash.cloudflare.com/pages
2. Click en tu proyecto
3. Tab **"View builds"**
4. Busca el build de branch `develop`
5. Copia la preview URL

**Ventajas**:
- ✅ Testea en ambiente real de Cloudflare
- ✅ Usa Cloudflare Workers API (producción)
- ✅ Usa D1 database (producción)
- ✅ Verifica que VITE_API_URL funcione
- ⚠️ Tarda ~2 min en buildear

---

### 3. Deploy a Producción
```bash
# Solo cuando develop funcione bien
git checkout main
git merge develop
git push origin main
```

**Deploy automático a**: `https://jetchance.alexxvives.workers.dev`

---

## 🎯 Decisión: ¿Cuándo Usar Cada Método?

### Testing Local (Siempre)
```bash
# Cambios pequeños, UI, componentes
git checkout develop
# ... cambios ...
npm run dev  # Test local
git add . && git commit -m "..." && git push
```

### Preview Deployment (Cuando sea crítico)
```bash
# Cambios en:
# - Autenticación
# - Pagos
# - APIs
# - Features críticas

git push origin develop
# Esperar ~2 min
# Testear en preview URL
# Si OK → merge a main
```

### Deploy a Main (Solo cuando confirmes)
```bash
# develop probado ✅
# preview probado ✅ (opcional)
git checkout main
git merge develop
git push origin main  # ← LIVE a usuarios
```

---

## 🚀 Ejemplo Completo

### Escenario: Agregar nueva feature de búsqueda

#### Paso 1: Desarrollo
```bash
git checkout develop
git checkout -b feature/advanced-search

# Programar...
# Testear local en localhost:8000
```

#### Paso 2: Merge a Develop
```bash
git checkout develop
git merge feature/advanced-search
git push origin develop

# Ver preview en Cloudflare dashboard
# Testear preview URL (opcional)
```

#### Paso 3: Testing Local
```bash
# Ya en develop
npm run dev
# Testear todo funcione
```

#### Paso 4: Deploy a Producción
```bash
# Todo funciona ✅
git checkout main
git merge develop
git push origin main

# Cloudflare deployará a producción automáticamente
# Esperar ~2 min
# Verificar en https://jetchance.alexxvives.workers.dev
```

---

## ⚙️ Configuración Recomendada en Cloudflare

### Opción A: Solo Previews Automáticos (Default)
**Estado actual** - No requiere configuración
- `main` → Producción fija
- Cualquier otro branch → Preview temporal

### Opción B: Deploy Permanente para Develop
**Requiere configuración**:

1. Cloudflare Dashboard → Pages → jetchance
2. Settings → Builds & deployments
3. Configure preview deployments
4. Add branch: `develop`
5. Save

Resultado:
- `main` → `https://jetchance.alexxvives.workers.dev`
- `develop` → `https://develop.jetchance.pages.dev` (URL permanente)

---

## 💡 Mi Recomendación Personal

Para **solo programador**, usa este workflow simple:

```bash
# 1. Desarrolla en develop
git checkout develop
# ... código ...

# 2. Test local (SIEMPRE)
npm run dev
# Testea en localhost

# 3. Push cuando funcione local
git push origin develop

# 4. Para features críticas: testea preview
# Ve a Cloudflare dashboard → View builds → Preview URL

# 5. Cuando estés 100% seguro → Main
git checkout main
git merge develop  
git push origin main
```

**Frecuencia de deploy a main**:
- Cambios pequeños/UI: 1 vez al día o cuando acumules varios commits
- Features grandes: Después de testear bien en develop
- Hotfixes: Directo a main (emergencias)

---

## 🔍 Verificar Preview Deployments

### Ver tus deployments actuales:
```bash
# En tu navegador:
https://dash.cloudflare.com/[tu-account-id]/pages/view/jetchance

# Verás lista de builds:
# - Production (main)
# - Preview (develop, features)
```

### API de Cloudflare (opcional):
```bash
# Listar deployments
curl -X GET "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/jetchance/deployments" \
  -H "Authorization: Bearer {api_token}"
```

---

## ✅ Checklist Antes de Merge a Main

Antes de hacer `git merge develop` en main:

- [ ] ✅ Testeado localmente en `localhost:8000`
- [ ] ✅ Sin errores en consola del navegador
- [ ] ✅ Funcionalidades críticas probadas:
  - [ ] Login/Registro
  - [ ] Dashboard (admin/operator/customer)
  - [ ] Crear/Editar vuelos
  - [ ] Bookings (si aplica)
- [ ] ✅ (Opcional) Preview deployment testeado
- [ ] ✅ Commits descriptivos y organizados
- [ ] ✅ No hay código comentado o console.logs innecesarios

**Solo entonces**:
```bash
git checkout main
git merge develop
git push origin main
```

---

## 🆘 Rollback si Algo Falla

Si deployaste a main y algo falló:

### Opción 1: Revertir último commit
```bash
git checkout main
git revert HEAD
git push origin main
```

### Opción 2: Volver a tag estable
```bash
git checkout main
git reset --hard v1.0.0-stable
git push origin main --force
```

### Opción 3: Cloudflare Rollback
1. Cloudflare Dashboard → Pages → jetchance
2. View builds
3. Find last working build
4. Click **"Rollback to this deployment"**

---

## 📝 Resumen

| Acción | Branch | Testing | Deploy |
|--------|--------|---------|--------|
| Desarrollo diario | `develop` | Local | NO |
| Features nuevas | `feature/*` → `develop` | Local + Preview | NO |
| Deploy a usuarios | `main` | Local + Preview | SÍ ✅ |

**Regla de oro**: 
```
develop = Playground (experimenta aquí)
main = Producción (solo código probado)
```
