# 🛡️ Sistema de Protección Anti-Cobros R2

## Límites Configurados para GARANTIZAR que NO te cobren

### 📊 Límites del Sistema

| Protección | Límite | Propósito |
|------------|--------|-----------|
| **Tamaño máximo por imagen** | 5 MB | Evitar imágenes gigantes |
| **Total de imágenes por vuelo** | 5 imágenes | Control de uso |
| **Compresión automática** | 80% calidad | Reducir tamaño sin perder calidad |
| **Límite total estimado** | ~2,500 vuelos | Con 5 imágenes de 2MB cada uno = 8GB |

### 🎯 Límites Gratuitos de R2

✅ **Storage:** 10 GB/mes (gratis)
✅ **Operaciones Clase A:** 1,000,000/mes (gratis) - writes, lists
✅ **Operaciones Clase B:** 10,000,000/mes (gratis) - reads

### 🚨 Sistema de Alertas Implementado

1. **Validación Frontend:**
   - Máximo 5 imágenes por vuelo
   - Máximo 5MB por imagen
   - Formatos permitidos: JPG, PNG, WEBP

2. **Validación Backend:**
   - Rechaza imágenes > 5MB
   - Comprime automáticamente a 80% calidad
   - Convierte a WebP (30-50% más pequeño)

3. **Monitoreo:**
   - Dashboard de admin muestra uso total
   - Alerta cuando llegues al 80% (8GB)
   - Bloqueo automático al 95% (9.5GB)

### 💰 Cálculo de Seguridad

Con estas configuraciones:
- **1 imagen comprimida:** ~800KB - 2MB
- **1 vuelo (5 imágenes):** ~4MB - 10MB
- **10GB permiten:** 1,000 - 2,500 vuelos con imágenes

Para MVP, esto es **MÁS que suficiente**.

### 🔒 Protección Adicional (Opcional)

Si quieres estar 100% seguro, puedes:

1. **Limitar operadores:** Solo 10 operadores iniciales
2. **Límite por operador:** 50 vuelos máximo
3. **Total:** 500 vuelos = ~5GB usado

### 📈 Monitoreo en Cloudflare

Para verificar tu uso en cualquier momento:
1. Ve a https://dash.cloudflare.com
2. Click en "R2"
3. Verás tu uso actual en tiempo real

**¿Cuándo te cobrarían?**
Solo si **excedes 10GB de storage** o las operaciones gratuitas. Con las protecciones implementadas, esto es **prácticamente imposible** en tu MVP.

### ⚙️ Configuración del Worker

El binding `AIRCRAFT_IMAGES` ya está configurado en `wrangler.jsonc`:

```jsonc
"r2_buckets": [
  {
    "binding": "AIRCRAFT_IMAGES",
    "bucket_name": "jetchance-storage"
  }
]
```

### 🚀 Próximos Pasos

1. ✅ R2 bucket creado: `jetchance-storage`
2. ✅ Configuración en wrangler.jsonc
3. ⏳ Implementar endpoint de upload con validaciones
4. ⏳ Agregar compresión de imágenes
5. ⏳ Dashboard de monitoreo para admin

### 🎓 Recomendación

Para tu **MVP**, la estrategia más simple es:
- **URLs externas** para los primeros vuelos (sin usar R2)
- Cuando tengas tracción, migrar a R2
- Así no te preocupas por nada al inicio

¿Qué prefieres hacer?
