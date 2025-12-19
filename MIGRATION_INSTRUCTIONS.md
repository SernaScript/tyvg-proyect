# Instrucciones para la Migración del Modelo Trip

## ⚠️ IMPORTANTE: Haz un backup de tu base de datos antes de proceder

## Opción 1: Usar Prisma DB Push (Recomendado si no tienes migraciones)

Este comando sincroniza el schema sin crear migraciones formales:

```bash
npx prisma db push
```

**Ventajas:**
- Prisma intentará hacer los cambios de forma segura
- No necesitas escribir SQL manualmente
- Preserva los datos cuando es posible

**Desventajas:**
- No crea un historial de migraciones
- Puede fallar si hay conflictos complejos

## Opción 2: Ejecutar el Script SQL Manual

Si prefieres más control, puedes ejecutar el script SQL manualmente:

1. **Revisa el script** `prisma/migration_refactor_trip.sql` y ajusta según tus necesidades
2. **Haz backup de tu base de datos**
3. **Ejecuta el script** usando psql o tu cliente de base de datos preferido:

```bash
psql -U tu_usuario -d tu_base_de_datos -f prisma/migration_refactor_trip.sql
```

O desde pgAdmin o DBeaver, abre el archivo y ejecútalo.

## Pasos del Script SQL

El script hace lo siguiente:

1. ✅ Crea el nuevo enum `MeasureType`
2. ✅ Agrega las nuevas columnas a la tabla `trips` (temporalmente nullable)
3. ✅ Migra datos de `trip_requests` a `trips` (projectId)
4. ✅ Migra datos de `trip_materials` a `trips` (materialId, quantity)
5. ✅ Establece valores por defecto para campos requeridos
6. ✅ Elimina columnas antiguas de `trips`
7. ✅ Elimina índices antiguos
8. ✅ Crea nuevos índices
9. ✅ Agrega foreign keys
10. ✅ Elimina `evidenceType` de `trip_evidences`
11. ⚠️ **OPCIONAL**: Elimina tablas antiguas (comentado por seguridad)
12. ⚠️ **OPCIONAL**: Elimina enums antiguos (comentado por seguridad)

## Después de la Migración

1. **Genera el cliente de Prisma:**
   ```bash
   npx prisma generate
   ```

2. **Verifica que todo funcione:**
   ```bash
   npm run dev
   ```

3. **Si todo está bien, puedes eliminar las tablas antiguas manualmente:**
   - `trip_requests`
   - `trip_request_materials`
   - `trip_materials`
   - `trip_expenses`

## Notas Importantes

- El script migra datos cuando es posible, pero algunos campos pueden quedar NULL
- Revisa los datos después de la migración y completa manualmente los que falten
- Las tablas antiguas se mantienen por seguridad (comentadas en el script)
- Puedes eliminarlas manualmente después de verificar que todo funciona

## Si algo sale mal

Si necesitas revertir los cambios:

1. Restaura el backup de tu base de datos
2. O ejecuta los comandos de reversión (necesitarías crearlos manualmente)

## Verificación Post-Migración

Después de ejecutar la migración, verifica:

```sql
-- Verificar que trips tiene las nuevas columnas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trips';

-- Verificar que MeasureType existe
SELECT typname FROM pg_type WHERE typname = 'MeasureType';

-- Verificar que no hay trips sin materialId o projectId
SELECT COUNT(*) FROM trips WHERE "materialId" IS NULL OR "projectId" IS NULL;
```

