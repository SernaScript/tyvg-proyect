# Datos de Flypass - Sistema de Gestión

## 📋 Descripción

Este módulo gestiona y procesa datos de peajes desde el portal de Flypass (https://clientes.flypass.com.co/) utilizando web scraping con Playwright y migración automática a la base de datos.

## 🚀 Características

- **Scraping automatizado**: Descarga de datos desde el portal de Flypass
- **Migración inteligente**: Procesamiento automático de archivos Excel
- **Preservación de estado**: Mantiene el estado de contabilización existente
- **Interfaz intuitiva**: Modales con validaciones y estados de carga
- **Manejo de errores**: Captura de pantallas y logs detallados
- **Tiempo real**: Estado y progreso en vivo
- **Seguridad**: Las credenciales no se almacenan

## 🛠 Tecnologías Utilizadas

- **Playwright**: Automatización del navegador
- **Next.js**: Framework web y API routes
- **TypeScript**: Tipado estático
- **ShadCN UI**: Componentes de interfaz
- **Tailwind CSS**: Estilos
- **Prisma**: ORM para base de datos
- **XLSX**: Procesamiento de archivos Excel

## 📝 Cómo Usar

### 1. Scraping de Datos

En la página **Datos de Flypass**, haz clic en el botón **"Scraping"**:

- **NIT**: Número de identificación tributaria
- **Contraseña**: Contraseña de acceso a Flypass
- **Fecha Inicial**: Fecha de inicio del rango (formato: YYYY-MM-DD)
- **Fecha Final**: Fecha de fin del rango (formato: YYYY-MM-DD)

### 2. Migración de Excel

Haz clic en el botón **"Migrar Excel"** para procesar el archivo más reciente:

- Muestra estadísticas actuales de la base de datos
- Lista archivos Excel disponibles
- Migra automáticamente preservando el estado de contabilización

### 3. Resultados

El sistema mostrará:
- ✅ **Éxito**: Si la operación fue completada
- ❌ **Error**: Si ocurrió algún problema
- 📊 **Detalles**: Información del proceso realizado

## 🔧 Configuración Técnica

### Archivos Principales

```
src/
├── lib/
│   ├── WebScraper.ts          # Clase base para web scraping
│   ├── FlypassScraper.ts      # Lógica específica de Flypass
│   ├── FlypassDataMapper.ts   # Mapeo de datos a la base de datos
│   └── ExcelProcessor.ts      # Procesamiento de archivos Excel
├── app/
│   ├── api/
│   │   ├── flypass-scraping/
│   │   │   └── route.ts       # API endpoint para el scraping
│   │   └── flypass-data/
│   │       └── migrate/
│   │           └── route.ts   # API endpoint para migración
│   └── areas/accounting/flypass-data/
│       └── page.tsx           # Página principal
├── components/
│   ├── modals/
│   │   ├── FlypassScrapingModal.tsx    # Modal de scraping
│   │   └── FlypassMigrationModal.tsx   # Modal de migración
│   └── ScrapingStatus.tsx     # Estado del sistema
└── app/automatizacion-f2x/
    └── page.tsx              # Página principal del módulo
```

### API Endpoint

**POST** `/api/flypass-scraping`

```json
{
  "nit": "900698993",
  "password": "tu_contraseña",
  "startDate": "2025-04-01",
  "endDate": "2025-04-02"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Scraping completado exitosamente. Archivo descargado.",
  "data": {
    "nit": "900698993",
    "dateRange": "2025-04-01 - 2025-04-02",
    "downloadTime": "2025-08-27T21:30:00.000Z"
  }
}
```

## 🔍 Proceso Detallado

### Lo que hace el scraper:

1. **Inicialización**: Abre navegador Chromium
2. **Navegación**: Va a https://clientes.flypass.com.co/
3. **Login**: Introduce credenciales y hace clic en iniciar sesión
4. **Navegación**: Va a la sección de facturas
5. **Configuración**: Establece filtros de fecha y tipo "todos"
6. **Búsqueda**: Ejecuta la consulta
7. **Descarga**: Descarga el archivo de resultados
8. **Finalización**: Cierra navegador y retorna resultado

### Manejo de Errores

- **Selectores múltiples**: Intenta diferentes formas de encontrar elementos
- **Capturas de pantalla**: Guarda imágenes cuando hay errores
- **Timeouts**: Maneja tiempos de espera razonables
- **Logs detallados**: Registra cada paso del proceso

## ⚙️ Configuración Avanzada

### Modificar comportamiento del navegador

En `src/lib/FlypassScraper.ts`:

```typescript
this.scraper = new WebScraper({
  browserType: 'chromium',  // 'firefox' | 'webkit'
  headless: false,          // true para ocultar navegador
  timeout: 30000           // timeout en milisegundos
});
```

### Personalizar selectores

Si Flypass cambia su interfaz, puedes actualizar los selectores en el método correspondiente del `FlypassScraper`.

## 🚨 Consideraciones Importantes

### Seguridad
- Las credenciales se envían por HTTPS
- No se almacenan credenciales en el servidor
- Proceso se ejecuta en tiempo real sin persistencia

### Limitaciones
- Depende de la estructura del sitio web de Flypass
- Requiere que Playwright esté instalado correctamente
- Tiempo de ejecución puede variar según la conexión

### Debugging
- Las capturas de pantalla se guardan cuando hay errores
- Los logs se muestran en la consola del navegador
- El estado se actualiza en tiempo real en la interfaz

## 📊 Monitoreo

El panel de estado muestra:
- **Estado actual**: Si hay un proceso ejecutándose
- **Última ejecución**: Cuándo fue la última vez que se ejecutó
- **Estadísticas**: Procesados hoy y tasa de éxito
- **Servicios**: Estado de Playwright y dependencias

## 🔄 Mantenimiento

### Actualizar selectores
Si Flypass cambia su interfaz, actualiza los selectores en:
- `src/lib/FlypassScraper.ts`

### Agregar nuevas validaciones
Modifica la función de validación en:
- `src/app/api/flypass-scraping/route.ts`

### Mejorar interfaz
Personaliza los componentes en:
- `src/components/LoginForm.tsx`
- `src/components/ScrapingStatus.tsx`

---

## 🆘 Solución de Problemas

### Error: "Cannot find module 'playwright'"
```bash
npm install playwright
npx playwright install
```

### Error: "No se pudo encontrar el botón de login"
- Verifica que las credenciales sean correctas
- Revisa la captura de pantalla generada
- El sitio web podría haber cambiado

### Proceso muy lento
- Verifica tu conexión a internet
- Flypass podría estar experimentando lentitud
- Aumenta el timeout si es necesario

---

*Desarrollado con Next.js, TypeScript y Playwright para automatización robusta y segura.*
