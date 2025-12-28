# Migración en Producción: Tabla driver_vehicles

## ⚠️ IMPORTANTE: Para Producción

**NO uses `prisma db push` en producción.** Este comando es solo para desarrollo.

## Proceso Correcto para Producción

### 1. En Desarrollo (ya completado)

Ya ejecutaste `prisma db push` en desarrollo, lo cual está bien. La tabla `driver_vehicles` ya existe en tu base de datos de desarrollo.

### 2. Para Producción - Opción Recomendada

#### Opción A: Ejecutar el Script SQL Manualmente (Más Seguro)

1. **Haz backup de tu base de datos de producción**

2. **Conecta a tu base de datos de producción:**
   ```bash
   psql -U tu_usuario -d tu_base_de_datos_produccion -h tu_host
   ```

3. **Ejecuta el script SQL:**
   ```bash
   psql -U tu_usuario -d tu_base_de_datos_produccion -h tu_host -f prisma/add_driver_vehicle_relation.sql
   ```

   O copia y pega el contenido del archivo `prisma/add_driver_vehicle_relation.sql` en tu cliente SQL de producción.

#### Opción B: Usar Prisma Migrate Deploy (Si tienes migraciones formales)

Si decides crear migraciones formales en el futuro:

```bash
npx prisma migrate deploy
```

Este comando aplica todas las migraciones pendientes sin perder datos.

### 3. Después de la Migración en Producción

1. **Genera el cliente de Prisma en producción:**
   ```bash
   npx prisma generate
   ```

2. **Verifica que la tabla existe:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'driver_vehicles';
   ```

## Scripts Disponibles en package.json

- `npm run db:push` - Solo para desarrollo (sincroniza schema sin migraciones)
- `npm run db:migrate` - Solo para desarrollo (crea y aplica migraciones)
- `npm run db:migrate:deploy` - Para producción (aplica migraciones existentes)
- `npm run build` - Genera Prisma Client y construye la app (NO aplica migraciones)

## Nota sobre Vercel/Producción

El script de build en `package.json` y `vercel.json` ejecuta:
```bash
npm run build
```

Este comando:
- ✅ Genera el cliente de Prisma (`prisma generate`)
- ✅ Construye la aplicación Next.js
- ❌ NO aplica migraciones de base de datos

**Las migraciones de base de datos deben ejecutarse manualmente antes del deploy** o configurarse como parte del proceso de CI/CD.

## Recomendación

Para producción, ejecuta el script SQL manualmente antes de hacer el deploy. Es la forma más segura y controlada.

