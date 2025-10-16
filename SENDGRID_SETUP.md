# Configuración de SendGrid para Envío de Correos

Este documento explica cómo configurar SendGrid para el envío automático de correos cuando se crean nuevos usuarios en el sistema.

## 1. Crear una cuenta en SendGrid

1. Ve a [SendGrid](https://sendgrid.com/) y crea una cuenta gratuita
2. Verifica tu email y completa el proceso de registro
3. Una vez en el dashboard, ve a **Settings** > **API Keys**

## 2. Crear una API Key

1. En la sección de API Keys, haz clic en **Create API Key**
2. Dale un nombre descriptivo (ej: "TYVG Sistema")
3. Selecciona **Restricted Access** para mayor seguridad
4. En los permisos, selecciona solo **Mail Send** > **Full Access**
5. Copia la API Key generada (comienza con `SG.`)

## 3. Verificar un Email Remitente

1. Ve a **Settings** > **Sender Authentication**
2. Selecciona **Single Sender Verification**
3. Haz clic en **Create New Sender**
4. Completa el formulario con:
   - **From Name**: TYVG Sistema
   - **From Email**: noreply@tu-dominio.com (o el email que prefieras)
   - **Reply To**: admin@tu-dominio.com
   - **Company Address**: Tu dirección de empresa
5. Verifica el email haciendo clic en el enlace que te envían

## 4. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# SendGrid Configuration
SENDGRID_API_KEY="SG.tu-api-key-aqui"
SENDGRID_FROM_EMAIL="noreply@tu-dominio.com"
```

## 5. Configurar URL de la Aplicación (Opcional)

Para que los enlaces en los correos funcionen correctamente, configura la URL de tu aplicación:

```env
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

## 6. Probar la Configuración

1. Reinicia tu servidor de desarrollo
2. Ve a la página de usuarios en tu aplicación
3. Crea un nuevo usuario
4. Verifica que se envíe el correo de activación

## Funcionalidades Implementadas

### Correo de Activación de Usuario

Cuando se crea un nuevo usuario, el sistema automáticamente:

- ✅ Envía un correo con los datos de acceso
- ✅ Incluye email, contraseña y rol del usuario
- ✅ Proporciona un enlace directo al login
- ✅ Muestra un diseño profesional y responsive
- ✅ Incluye instrucciones de seguridad
- ✅ Maneja errores graciosamente si SendGrid no está configurado

### Contenido del Correo

El correo incluye:
- **Asunto**: "Bienvenido a TYVG - Datos de Acceso"
- **Datos de acceso**: Email, contraseña y rol
- **Enlace de login**: Botón directo para acceder al sistema
- **Advertencia de seguridad**: Recomendación de cambiar la contraseña
- **Diseño responsive**: Se ve bien en desktop y móvil

## Solución de Problemas

### El correo no se envía

1. **Verifica la API Key**: Asegúrate de que la API Key sea correcta y tenga permisos de Mail Send
2. **Verifica el email remitente**: El email debe estar verificado en SendGrid
3. **Revisa los logs**: Los errores se muestran en la consola del servidor
4. **Verifica las variables de entorno**: Asegúrate de que estén configuradas correctamente

### Error de autenticación

- Verifica que la API Key tenga el formato correcto (comienza con `SG.`)
- Asegúrate de que la API Key tenga permisos de Mail Send
- Verifica que el email remitente esté verificado

### El correo llega a spam

- Configura SPF, DKIM y DMARC en tu dominio
- Considera usar un dominio dedicado para correos transaccionales
- Evita palabras que puedan activar filtros de spam

## Límites de la Cuenta Gratuita

- **100 correos por día**
- **40,000 correos por mes**
- **Sin soporte prioritario**

Para mayor volumen, considera actualizar a un plan de pago.

## Seguridad

- ✅ La API Key se almacena como variable de entorno
- ✅ Solo se envían datos necesarios en el correo
- ✅ Se recomienda cambiar la contraseña después del primer login
- ✅ Los errores se manejan sin exponer información sensible

## Personalización

Puedes personalizar el contenido del correo editando el archivo `src/lib/EmailService.ts`:

- Cambiar el nombre de la empresa
- Modificar el diseño del correo
- Agregar más información
- Cambiar el idioma o formato

## Soporte

Si tienes problemas con la configuración:

1. Revisa los logs del servidor
2. Verifica la documentación de SendGrid
3. Consulta la sección de solución de problemas
4. Contacta al administrador del sistema
