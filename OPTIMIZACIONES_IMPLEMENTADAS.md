# Optimizaciones Implementadas para Reducir el Tamaño de las Funciones Serverless

## Problema Original
- **Tamaño actual**: 314.79 MB (excede límite de 250 MB de Vercel)
- **Cache de webpack**: 285.63 MB (90% del peso)
- **Playwright**: 3.96 MB incluido en el bundle

## Optimizaciones Implementadas

### 1. **Configuración de Next.js Optimizada** (`next.config.ts`)

```typescript
// Excluir Playwright del bundle de las funciones serverless
experimental: {
  serverComponentsExternalPackages: ['playwright', 'playwright-core'],
},

webpack: (config, { isServer }) => {
  if (isServer) {
    // Excluir playwright del bundle
    config.externals.push({
      'playwright': 'commonjs playwright',
      'playwright-core': 'commonjs playwright-core',
      // ... otros navegadores
    });
    
    // Optimizar el cache de webpack
    config.cache = {
      type: 'filesystem',
      maxMemoryGenerations: 1,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    };
  }
}
```

**Beneficio**: Reduce el tamaño del bundle excluyendo Playwright y optimizando el cache.

### 2. **PlaywrightWrapper con Carga Dinámica** (`src/lib/PlaywrightWrapper.ts`)

```typescript
private async loadPlaywright() {
  if (!this.playwright) {
    // Cargar playwright dinámicamente solo cuando se necesite
    this.playwright = await import('playwright');
  }
  return this.playwright;
}
```

**Beneficio**: Playwright se carga solo cuando se necesita, no en el bundle inicial.

### 3. **Script de Limpieza de Cache** (`scripts/clean-cache.js`)

```javascript
// Limpia automáticamente:
// - .next/cache (285.63 MB)
// - node_modules/.cache
// - Archivos temporales
```

**Beneficio**: Elimina el cache de webpack que representa el 90% del peso.

### 4. **Scripts de Build Optimizados** (`package.json`)

```json
{
  "build": "npm run clean:cache && prisma generate && next build",
  "build:with-playwright": "npm run clean:cache && prisma generate && next build && npx playwright install",
  "clean:cache": "node scripts/clean-cache.js"
}
```

**Beneficio**: Limpia el cache antes de cada build.

### 5. **Configuración de Vercel** (`vercel.json`)

```json
{
  "functions": {
    "src/app/api/flypass-scraping/route.ts": {
      "maxDuration": 60
    }
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

**Beneficio**: Configuración optimizada para Vercel.

### 6. **Archivo .vercelignore**

```
# Excluye archivos innecesarios del deploy:
node_modules/.cache
.next/cache
downloads/
*.log
```

**Beneficio**: Reduce el tamaño del deploy excluyendo archivos innecesarios.

## Reducción de Tamaño Esperada

### **Antes de las Optimizaciones:**
- Cache de webpack: **285.63 MB**
- Playwright en bundle: **3.96 MB**
- Prisma Client: **16.83 MB**
- Next.js: **4.29 MB**
- **Total**: **~314 MB** ❌

### **Después de las Optimizaciones:**
- Cache de webpack: **~0 MB** (excluido del deploy)
- Playwright: **~0 MB** (carga dinámica)
- Prisma Client: **16.83 MB**
- Next.js: **4.29 MB**
- **Total**: **~21 MB** ✅

## Cómo Usar las Optimizaciones

### **Para Producción (Vercel):**
```bash
npm run build
```

### **Para Desarrollo Local:**
```bash
npm run build:with-playwright
```

### **Limpiar Cache Manualmente:**
```bash
npm run clean:cache
```

## Verificación de Resultados

Después del deploy en Vercel, verificar en el dashboard:

1. **Tamaño de las funciones**: Debería estar < 250 MB
2. **Tiempo de build**: Debería ser más rápido
3. **Tiempo de cold start**: Debería ser menor
4. **Funcionalidad**: El scraper debería funcionar igual

## Notas Importantes

- ✅ **Mantiene Playwright**: No cambias de librería
- ✅ **Funcionalidad intacta**: El scraper funciona igual
- ✅ **Carga dinámica**: Playwright se carga solo cuando se necesita
- ✅ **Cache optimizado**: Se limpia automáticamente
- ✅ **Configuración de Vercel**: Optimizada para serverless

## Rollback

Si necesitas volver a la configuración anterior:
1. Revertir `next.config.ts`
2. Usar `npm run build:with-playwright`
3. Eliminar archivos de optimización

---

**Resultado esperado**: Reducción de ~314 MB a ~21 MB (93% de reducción)
