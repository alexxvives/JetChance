# 🌳 Git Branching Strategy - JetChance

## 📋 Estructura de Branches

### `main` - Producción
- **Propósito**: Código estable y desplegado en Cloudflare Pages
- **Protección**: Solo merge desde `develop` después de testing
- **Deploy**: Automático a producción con cada push
- **Regla**: NUNCA hacer commit directo aquí

### `develop` - Integración y Testing
- **Propósito**: Testing antes de producción
- **Uso**: Merge de features aquí primero
- **Testing**: Verifica que todo funcione antes de merge a `main`
- **Regla**: Merge features aquí, luego a `main` cuando esté estable

### `feature/*` - Desarrollo de Features
- **Formato**: `feature/nombre-descriptivo`
- **Ejemplos**: 
  - `feature/payment-stripe`
  - `feature/operator-analytics`
  - `feature/ui-improvements`
- **Workflow**: Crear → Desarrollar → Merge a `develop` → Eliminar

### `hotfix/*` - Fixes Urgentes en Producción
- **Formato**: `hotfix/descripcion-fix`
- **Ejemplo**: `hotfix/payment-crash`
- **Workflow**: Desde `main` → Fix → Merge a `main` Y `develop`

---

## 🔄 Workflow Diario

### 1. Trabajar en Nueva Feature
```bash
# Desde develop, crear nueva branch
git checkout develop
git pull origin develop
git checkout -b feature/nombre-feature

# Trabajar y hacer commits
git add .
git commit -m "feat: descripción del cambio"

# Push a GitHub
git push origin feature/nombre-feature
```

### 2. Finalizar Feature
```bash
# Merge a develop para testing
git checkout develop
git merge feature/nombre-feature

# Test localmente
npm run dev

# Si todo OK, push develop
git push origin develop

# Opcional: eliminar feature branch
git branch -d feature/nombre-feature
git push origin --delete feature/nombre-feature
```

### 3. Deploy a Producción
```bash
# Cuando develop esté estable
git checkout main
git merge develop

# Push a producción (triggerea Cloudflare Pages deploy)
git push origin main

# Volver a develop para seguir trabajando
git checkout develop
```

### 4. Hotfix Urgente
```bash
# Fix crítico en producción
git checkout main
git checkout -b hotfix/descripcion

# Fix rápido
git add .
git commit -m "hotfix: descripción"

# Merge a main
git checkout main
git merge hotfix/descripcion
git push origin main

# Merge a develop también
git checkout develop
git merge hotfix/descripcion
git push origin develop

# Eliminar hotfix branch
git branch -d hotfix/descripcion
```

---

## 🎯 Tu Situación Actual

**Estado actual**: Todo en `main` (2 commits adelante de origin)

### Acción Recomendada AHORA:

#### Opción A: Empezar Estrategia de Branches (Recomendado)
```bash
# 1. Push commits actuales a main (son fixes importantes)
git push origin main

# 2. Crear branch develop desde main
git checkout -b develop
git push origin develop

# 3. Para próximos cambios, trabajar en features
git checkout -b feature/ui-refinements
# ... hacer cambios ...
git push origin feature/ui-refinements
```

#### Opción B: Crear Tag de Versión Estable
```bash
# 1. Push a main
git push origin main

# 2. Crear tag de versión funcional
git tag -a v1.0.0-stable -m "First stable production version with all fixes"
git push origin v1.0.0-stable

# 3. Ahora puedes experimentar tranquilo
# Si algo falla, siempre puedes volver:
git checkout v1.0.0-stable
```

---

## 📝 Convenciones de Commits

### Formato
```
<tipo>: <descripción corta>

<descripción detallada opcional>
```

### Tipos
- `feat:` - Nueva funcionalidad
- `fix:` - Bug fix
- `refactor:` - Refactorización sin cambios funcionales
- `style:` - Cambios de estilo/UI
- `docs:` - Documentación
- `test:` - Tests
- `chore:` - Tareas de mantenimiento

### Ejemplos
```bash
git commit -m "feat: add operator analytics dashboard"
git commit -m "fix: resolve payment processing error in production"
git commit -m "style: improve mobile responsive design for hero section"
git commit -m "refactor: extract API calls to dedicated service"
```

---

## 🛡️ Protección de Main Branch (GitHub Settings)

### Configuración Recomendada en GitHub:
1. Ve a: **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Activa:
   - ☑️ Require pull request reviews before merging
   - ☑️ Require status checks to pass (si tienes CI/CD)
   - ☑️ Include administrators (para forzarte a usar workflow)

**Para solo tú**: No es crítico, pero ayuda a mantener disciplina

---

## 🎨 Ejemplo Completo - Próxima Sesión

```bash
# Hoy: Push fixes actuales
git push origin main

# Crear develop
git checkout -b develop
git push origin develop

# Mañana: Nueva feature
git checkout develop
git checkout -b feature/advanced-search

# Trabajar...
git add .
git commit -m "feat: add advanced flight search filters"
git push origin feature/advanced-search

# Testing
git checkout develop
git merge feature/advanced-search
# Test local...

# Si OK → Producción
git checkout main
git merge develop
git push origin main

# Volver a develop
git checkout develop
```

---

## 🚨 Ventajas para TI

### Ahora (Sin branches):
- ❌ Cada cambio va directo a producción
- ❌ Si rompes algo, pierdes versión funcional
- ❌ No puedes experimentar tranquilo
- ❌ Difícil revertir cambios malos

### Con Branches:
- ✅ `main` siempre funcional como respaldo
- ✅ Experimenta en `feature/*` sin miedo
- ✅ Test en `develop` antes de producción
- ✅ Rollback fácil si algo falla
- ✅ Historial organizado por features

---

## 💡 Mi Recomendación

### Para HOY (Inmediato):
```bash
# 1. Push lo que tienes (son fixes críticos)
git push origin main

# 2. Tag esta versión como estable
git tag -a v1.0.0 -m "Stable production version - all localhost fixes applied"
git push origin v1.0.0

# 3. Crear develop para futuro
git checkout -b develop
git push origin develop
```

### Para MAÑANA y Adelante:
- Trabaja en `feature/*` branches
- Merge a `develop` para testing
- Solo merge a `main` cuando confirmes que funciona
- Cloudflare Pages solo deployará cuando pushes a `main`

---

## ¿Quieres que Configure esto Ahora?

Puedo ejecutar los comandos para:
1. ✅ Push tus fixes actuales a `main`
2. ✅ Crear tag `v1.0.0` de versión estable
3. ✅ Crear branch `develop`
4. ✅ Crear tu primera `feature/` branch para próximos cambios

**¿Procedemos?** 🚀
