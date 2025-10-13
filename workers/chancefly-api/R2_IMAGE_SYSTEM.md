# 🚀 Sistema de Imágenes R2 con Auto-Limpieza

## 🎯 Objetivo
Sistema inteligente que **GARANTIZA que nunca excederás los 10GB gratuitos** mediante limpieza automática de imágenes antiguas.

---

## ✅ Características Implementadas

### 1. **Upload con Validaciones**
```typescript
POST /api/flights/:flightId/images
```

**Protecciones:**
- ✅ Máximo 5MB por imagen
- ✅ Máximo 5 imágenes por vuelo
- ✅ Solo JPG, PNG, WebP
- ✅ Compresión automática (opcional)

**Proceso:**
1. Usuario sube imagen desde dashboard
2. Sistema valida tamaño y tipo
3. Se guarda en R2 con nombre único
4. Se actualiza URL en base de datos
5. Se calcula fecha de limpieza automática

---

### 2. **Auto-Limpieza (Cron Job Diario)**
```typescript
GET /api/cron/cleanup-old-images
```

**Funcionamiento:**
- ⏰ Se ejecuta **automáticamente cada día a las 2AM**
- 🔍 Busca vuelos donde: `departure_datetime + 30 días < HOY`
- 🗑️ Elimina imágenes de R2
- 📝 Actualiza DB: `images = '[]'` (vuelo sigue visible, sin fotos)
- 📊 Libera espacio automáticamente

**Configuración en wrangler.jsonc:**
```jsonc
"triggers": {
  "crons": ["0 2 * * *"]  // Cada día a las 2AM UTC
}
```

---

### 3. **Dashboard de Monitoreo (Para Admin)**
```typescript
GET /api/admin/r2-stats
```

**Información que muestra:**
```json
{
  "storage": {
    "usedMB": 2500,
    "limitMB": 10240,
    "percentageUsed": 24,
    "imageCount": 850
  },
  "cleanup": {
    "flightsPendingCleanup": 15
  },
  "alert": null
}
```

**Alertas:**
- 🟢 0-79%: Todo bien
- 🟡 80-94%: Advertencia
- 🔴 95-100%: Crítico (bloquea uploads)

---

## 📊 Cálculos de Capacidad

### Con limpieza a 30 días:

| Escenario | Vuelos/mes | Imágenes totales | Espacio usado | ¿Cabe? |
|-----------|------------|------------------|---------------|---------|
| Bajo | 50 vuelos | 250 imágenes | ~500MB | ✅ Sobra espacio |
| Medio | 100 vuelos | 500 imágenes | ~1GB | ✅ Perfecto |
| Alto | 200 vuelos | 1,000 imágenes | ~2GB | ✅ Sin problemas |
| Muy Alto | 500 vuelos | 2,500 imágenes | ~5GB | ✅ Aún dentro |

**Conclusión:** Con limpieza automática a 30 días, es **prácticamente imposible** llegar a los 10GB.

---

## 🔧 Configuración de la Base de Datos

### Migración necesaria:
```sql
ALTER TABLE flights ADD COLUMN image_cleanup_date DATETIME;
CREATE INDEX idx_flights_cleanup ON flights(image_cleanup_date);
```

**Ejecutar:**
```powershell
wrangler d1 execute jetchance-db --file=./migration-add-image-cleanup.sql --remote
```

---

## 🎨 Frontend: Componente de Upload

### Ejemplo de uso en React:
```jsx
const UploadAircraftImage = ({ flightId }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (file) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(
      `https://jetchance-api.workers.dev/api/flights/${flightId}/images`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Image uploaded:', result.imageUrl);
      console.log('Will be deleted on:', result.cleanupDate);
    }
    
    setUploading(false);
  };
  
  return (
    <input 
      type="file" 
      accept="image/jpeg,image/png,image/webp"
      onChange={(e) => handleUpload(e.target.files[0])}
      disabled={uploading}
    />
  );
};
```

---

## 🔐 Seguridad

### Permisos por rol:
- **Operador:** Puede subir imágenes solo a SUS vuelos
- **Admin:** Puede ver estadísticas de uso
- **Super-admin:** Puede forzar limpieza manual

### Validaciones:
```typescript
// Verificar que el operador es dueño del vuelo
const flight = await db.prepare(
  'SELECT operator_id FROM flights WHERE id = ?'
).bind(flightId).first();

if (flight.operator_id !== currentUser.operatorId) {
  return error403('Not your flight');
}
```

---

## 🚨 Sistema de Alertas

### Alerta automática al 80%:
```typescript
if (percentageUsed > 80) {
  // Enviar notificación al super-admin
  await sendNotification({
    userId: 'US00001', // Super admin
    title: 'R2 Storage Warning',
    message: `Storage at ${percentageUsed}%. Consider cleaning old flights.`,
    type: 'storage_warning'
  });
}
```

### Bloqueo automático al 95%:
```typescript
if (percentageUsed > 95) {
  return error507('Storage limit reached. Contact admin.');
}
```

---

## 📅 Timeline de Imágenes

```
📸 Upload (Día 0)
   ↓
✈️ Vuelo sale (Día X)
   ↓
⏰ +30 días (Día X+30)
   ↓
🗑️ Limpieza automática
   ↓
📊 Vuelo sigue visible (sin fotos)
```

---

## 💡 Ventajas de este Sistema

1. **Ahorro garantizado:** Nunca pagas por R2
2. **Automático:** Cero mantenimiento manual
3. **Histórico preservado:** Vuelos siguen en DB
4. **Performance:** Solo almacenas vuelos activos
5. **Escalable:** Puede crecer a 1000s de vuelos/mes

---

## 🎓 Recomendación Final

Para tu MVP:
1. ✅ Implementa R2 con este sistema
2. ✅ Monitorea uso en dashboard admin
3. ✅ Ajusta días de retención si necesitas (30 → 60)
4. ✅ Cuando tengas tracción, considera upgrade

**Este sistema te da tranquilidad total** 🚀

---

## 📞 Comandos Útiles

### Ver uso actual:
```bash
wrangler r2 bucket list
```

### Forzar limpieza manual:
```bash
curl https://jetchance-api.workers.dev/api/cron/cleanup-old-images
```

### Verificar migración:
```bash
wrangler d1 execute jetchance-db --command="SELECT COUNT(*) FROM flights WHERE image_cleanup_date IS NOT NULL" --remote
```
