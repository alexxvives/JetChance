# Desarrollo - JetChance

## 🎯 Setup Simple

JetChance usa **solo Cloudflare Worker** para la API, tanto en desarrollo como producción.

### Para desarrollar:

```bash
cd frontend
npm run dev
```

**¡Eso es todo!** 🎉

El frontend se conecta automáticamente a `www.jetchance.com/api`.

---

## 🌐 Arquitectura

```
Development (localhost:5173)
    ↓
www.jetchance.com/api
    ↓
Cloudflare Worker
    ↓
D1 Database (producción)
```

```
Production (www.jetchance.com)
    ↓
/api (mismo dominio)
    ↓
Cloudflare Worker
    ↓
D1 Database (producción)
```

---

## ✅ Ventajas de este enfoque

- **Simple**: No necesitas backend local
- **Consistente**: Mismo API en dev y prod
- **Rápido**: CDN global de Cloudflare
- **Económico**: 100,000 requests/día gratis (más que suficiente)
- **Sin configuración**: Cero archivos `.env` necesarios

---

## 🧪 Datos de Prueba

Usa estos usuarios para testing:

**Admin:**
- Email: `admin@jetchance.com`
- Password: `password`

**Super Admin:**
- Email: `superadmin@jetchance.com`
- Password: `password`

---

## 📊 Límites de Cloudflare (Free Tier)

- **Workers**: 100,000 requests/día
- **D1 Database**: 5 millones de lecturas/día
- **Pages**: Unlimited requests

**En desarrollo típico usarás:**
- ~500-1000 requests/día
- Muy lejos de los límites 👍

---

## 🔍 Debugging

### Ver logs del Worker:

```bash
cd workers/jetchance-api
npx wrangler tail
```

Esto muestra logs en tiempo real de todas las requests al Worker.

### Ver errores en el navegador:

Abre DevTools → Console para ver errores del frontend.

---

## � Deploy

Los deploys son automáticos:

1. **Frontend** (Cloudflare Pages):
   ```bash
   git push origin main
   ```
   Auto-deploy en ~2 minutos → `www.jetchance.com`

2. **Worker** (API):
   ```bash
   cd workers/jetchance-api
   npx wrangler deploy
   ```
   Deploy en ~10 segundos → `www.jetchance.com/api/*`

---

## 💡 Tips

- **Hot reload**: Vite detecta cambios automáticamente
- **CORS**: Ya configurado en el Worker para `www.jetchance.com`
- **Cache**: Haz hard refresh (`Ctrl+Shift+R`) si ves datos viejos
- **Errores 404**: Verifica que el Worker esté desplegado
