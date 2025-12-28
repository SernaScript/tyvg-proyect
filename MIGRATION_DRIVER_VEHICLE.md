# Migración: Tabla driver_vehicles

## ⚠️ IMPORTANTE: Esta migración solo agrega una nueva tabla, NO modifica datos existentes

## Opción 1: Usar Prisma DB Push (Recomendado - Más Seguro)

Este comando sincroniza el schema y solo agregará la nueva tabla `driver_vehicles`:

```bash
npx prisma db push
```

**Ventajas:**
- Solo agrega la nueva tabla
- No modifica datos existentes
- Prisma detecta automáticamente qué agregar
- Es seguro y rápido

**Nota:** Este comando no crea un historial de migraciones, pero es la forma más segura de agregar solo la nueva tabla.

## Opción 2: Ejecutar el Script SQL Manualmente

Si prefieres más control, ejecuta el script SQL directamente:

1. **Conecta a tu base de datos PostgreSQL:**
   ```bash
   psql -U tu_usuario -d postgres
   ```

2. **O desde tu cliente de base de datos preferido (pgAdmin, DBeaver, etc.)**

3. **Ejecuta el script:**
   ```bash
   psql -U tu_usuario -d postgres -f prisma/add_driver_vehicle_relation.sql
   ```

   O copia y pega el contenido del archivo `prisma/add_driver_vehicle_relation.sql` en tu cliente SQL.

## Opción 3: Resolver el Drift y Crear Migración Formal

Si necesitas mantener un historial de migraciones:

1. **Primero, marca el estado actual como baseline:**
   ```bash
   npx prisma migrate resolve --applied 0_init
   ```

2. **Luego crea la migración solo para la nueva tabla:**
   ```bash
   npx prisma migrate dev --create-only --name add_driver_vehicle_relation
   ```

3. **Revisa el archivo SQL generado y aplícalo:**
   ```bash
   npx prisma migrate deploy
   ```

## Después de la Migración

1. **Genera el cliente de Prisma:**
   ```bash
   npx prisma generate
   ```

2. **Verifica que la tabla se creó correctamente:**
   ```bash
   npx prisma studio
   ```
   O verifica directamente en tu base de datos:
   ```sql
   SELECT * FROM driver_vehicles LIMIT 1;
   ```

## Verificación

Para verificar que todo está correcto:

```sql
-- Verificar que la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'driver_vehicles';

-- Verificar índices
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'driver_vehicles';

-- Verificar foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conrelid = 'driver_vehicles'::regclass;
```

## Nota sobre el Drift

El mensaje de "drift detected" aparece porque tu base de datos no tiene un historial de migraciones de Prisma. Esto es normal si la base de datos se creó directamente. 

**La opción 1 (`prisma db push`) es la más segura** porque:
- Solo agrega lo que falta (la nueva tabla)
- No intenta modificar tablas existentes
- No requiere resolver el drift primero

