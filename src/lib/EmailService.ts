import sgMail from '@sendgrid/mail';

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface UserActivationEmailData {
  email: string;
  name: string | null;
  password?: string; // Opcional por seguridad - no se debe enviar en texto plano
  roleName: string;
  loginUrl: string;
  resetPasswordUrl?: string; // URL para restablecer contraseña
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@tyvg.com';
  private static readonly COMPANY_NAME = 'Logística Nutabe';


  /**
   * Envía un correo de activación de cuenta a un nuevo usuario
   */
  static async sendUserActivationEmail(data: UserActivationEmailData): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key no configurada. Correo no enviado.');
        return false;
      }

      const { email, name, password, roleName, loginUrl, resetPasswordUrl } = data;

      const htmlContent = this.generateActivationEmailHTML({
        name: name || 'Usuario',
        email,
        password,
        roleName,
        loginUrl,
        resetPasswordUrl: resetPasswordUrl || `${loginUrl}?forgotPassword=true`
      });

      const textContent = this.generateActivationEmailText({
        name: name || 'Usuario',
        email,
        password,
        roleName,
        loginUrl,
        resetPasswordUrl: resetPasswordUrl || `${loginUrl}?forgotPassword=true`
      });

      const msg = {
        to: email,
        from: {
          email: this.FROM_EMAIL,
          name: this.COMPANY_NAME
        },
        subject: `Bienvenido a ${this.COMPANY_NAME} - Datos de Acceso`,
        text: textContent,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`Correo de activación enviado exitosamente a: ${email}`);
      return true;

    } catch (error: any) {
      console.error('Error enviando correo de activación:', error);

      // Log detallado del error para debugging
      if (error.response) {
        console.error('SendGrid Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          body: error.response.body
        });

        // Log específico de los errores de SendGrid
        if (error.response.body && error.response.body.errors) {
          console.error('SendGrid Errors Details:', error.response.body.errors);
        }
      }

      return false;
    }
  }

  /**
   * Genera el contenido HTML del correo de activación
   */
  private static generateActivationEmailHTML(data: {
    name: string;
    email: string;
    password?: string;
    roleName: string;
    loginUrl: string;
    resetPasswordUrl: string;
  }): string {
    const { name, email, password, roleName, loginUrl, resetPasswordUrl } = data;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a ${this.COMPANY_NAME}</title>
        <style>
          /* Reset de estilos para clientes de correo */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f7f9;
            margin: 0;
            padding: 0;
            color: #334155;
          }

          .email-wrapper {
            width: 100%;
            background-color: #f4f7f9;
            padding: 40px 10px;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }

          .header {
            background-color: #1e293b; /* Azul marino profesional */
            padding: 40px 30px;
            text-align: center;
          }

          .logo-text {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .content {
            padding: 40px 50px;
            line-height: 1.6;
          }

          .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 15px;
          }

          .intro-text {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 30px;
          }

          .credentials-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
          }

          .credential-row {
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #edf2f7;
            padding-bottom: 8px;
          }

          .credential-row:last-child { border: none; }

          .label {
            font-size: 13px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
          }

          .value {
            font-size: 15px;
            font-weight: 600;
            color: #1e293b;
            font-family: 'Monaco', 'Consolas', monospace;
          }

          .role-badge {
            display: inline-block;
            background-color: #e0f2fe;
            color: #0369a1;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
          }

          .cta-container {
            text-align: center;
            margin: 35px 0;
          }

          .button {
            background-color: #2563eb; /* Azul brillante moderno */
            color: #ffffff !important;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            transition: background-color 0.3s ease;
          }

          .security-note {
            font-size: 13px;
            color: #94a3b8;
            text-align: center;
            padding: 0 20px;
          }

          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }

          .footer-text {
            font-size: 12px;
            color: #94a3b8;
            margin: 5px 0;
          }

          @media only screen and (max-width: 480px) {
            .content { padding: 30px 20px; }
            .greeting { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <div class="logo-text">${this.COMPANY_NAME}</div>
            </div>

            <div class="content">
              <h1 class="greeting">Bienvenido a bordo, ${name}</h1>
              <p class="intro-text">
                Es un gusto saludarte. Tu perfil ha sido habilitado con éxito en nuestra plataforma de gestión. 
                A partir de ahora, tienes acceso a todas las herramientas necesarias para optimizar tus procesos logísticos.
              </p>

              <div class="credentials-card">
                <div class="credential-row">
                  <span class="label">Usuario</span>
                  <span class="value">${email}</span>
                </div>
                <div class="credential-row">
                  <span class="label">Perfil asignado</span>
                  <span class="role-badge">${roleName}</span>
                </div>
              </div>

              ${password ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>⚠️ Contraseña temporal:</strong> ${password}<br>
                  <small>Por seguridad, cambia esta contraseña después del primer inicio de sesión.</small>
                </p>
              </div>
              ` : `
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>🔒 Establece tu contraseña:</strong><br>
                  Para acceder al sistema, necesitas establecer tu contraseña. Haz clic en el botón de abajo para crear una contraseña segura.
                </p>
              </div>
              `}

              <div class="cta-container">
                ${password ? `
                  <a href="${loginUrl}" class="button">Iniciar sesión en la consola</a>
                ` : `
                  <a href="${resetPasswordUrl}" class="button">Establecer contraseña</a>
                `}
              </div>

              <p class="security-note">
                ${password ?
        'Por motivos de seguridad, el sistema le solicitará actualizar su contraseña tras el primer ingreso.' :
        'Si no solicitaste esta cuenta o tienes alguna dificultad técnica, contacta al administrador del sistema.'
      }
              </p>
            </div>

            <div class="footer">
              <p class="footer-text"><strong>${this.COMPANY_NAME}</strong> • Soluciones Logísticas Inteligentes</p>
              <p class="footer-text">© ${new Date().getFullYear()} Todos los derechos reservados.</p>
              <p class="footer-text" style="margin-top: 15px; font-style: italic;">
                Este es un mensaje automático, por favor no responda a esta dirección de correo.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido de texto plano del correo de activación
   */
  private static generateActivationEmailText(data: {
    name: string;
    email: string;
    password?: string;
    roleName: string;
    loginUrl: string;
    resetPasswordUrl: string;
  }): string {
    const { name, email, password, roleName, loginUrl, resetPasswordUrl } = data;

    return `
🚛 ¡Bienvenido a ${this.COMPANY_NAME}! 🚛

Hola ${name},

Tu cuenta ha sido creada exitosamente en el sistema de gestión logística de ${this.COMPANY_NAME}. 

═══════════════════════════════════════════════════════════════
                    DATOS DE ACCESO AL SISTEMA
═══════════════════════════════════════════════════════════════

📧 Email: ${email}
👤 Rol: ${roleName}

${password ? `
🔑 Contraseña temporal: ${password}

⚠️  IMPORTANTE: Por seguridad, te recomendamos cambiar tu 
    contraseña después del primer inicio de sesión.

🌐 Para acceder al sistema, visita: ${loginUrl}
` : `
🔒 Para establecer tu contraseña y acceder al sistema, visita:
   ${resetPasswordUrl}

   O usa la opción "¿Olvidaste tu contraseña?" en la página de login.
`}

📞 Si tienes alguna pregunta o necesitas ayuda con el sistema, 
    no dudes en contactar al administrador del sistema.

═══════════════════════════════════════════════════════════════

Este es un correo automático del sistema ${this.COMPANY_NAME}. 
Por favor, no respondas a este mensaje.

© ${new Date().getFullYear()} ${this.COMPANY_NAME}. 
Todos los derechos reservados.
    `.trim();
  }

  /**
   * Envía un correo de restablecimiento de contraseña
   */
  static async sendPasswordResetEmail(data: {
    email: string;
    name: string | null;
    resetUrl: string;
  }): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key no configurada. Correo no enviado.');
        return false;
      }

      const { email, name, resetUrl } = data;

      const htmlContent = this.generatePasswordResetEmailHTML({
        name: name || 'Usuario',
        resetUrl
      });

      const textContent = this.generatePasswordResetEmailText({
        name: name || 'Usuario',
        resetUrl
      });

      const msg = {
        to: email,
        from: {
          email: this.FROM_EMAIL,
          name: this.COMPANY_NAME
        },
        subject: `Restablecer contraseña - ${this.COMPANY_NAME}`,
        text: textContent,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`Correo de reset de contraseña enviado exitosamente a: ${email}`);
      return true;

    } catch (error: any) {
      console.error('Error enviando correo de reset:', error);

      if (error.response) {
        console.error('SendGrid Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          body: error.response.body
        });

        if (error.response.body && error.response.body.errors) {
          console.error('SendGrid Errors Details:', error.response.body.errors);
        }
      }

      return false;
    }
  }

  /**
   * Genera el contenido HTML del correo de reset de contraseña
   */
  private static generatePasswordResetEmailHTML(data: {
    name: string;
    resetUrl: string;
  }): string {
    const { name, resetUrl } = data;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablecer Contraseña - ${this.COMPANY_NAME}</title>
        <style>
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f7f9;
            margin: 0;
            padding: 0;
            color: #334155;
          }

          .email-wrapper {
            width: 100%;
            background-color: #f4f7f9;
            padding: 40px 10px;
          }

          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }

          .header {
            background-color: #1e293b;
            padding: 40px 30px;
            text-align: center;
          }

          .logo-text {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .content {
            padding: 40px 50px;
            line-height: 1.6;
          }

          .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 15px;
          }

          .intro-text {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 30px;
          }

          .cta-container {
            text-align: center;
            margin: 35px 0;
          }

          .button {
            background-color: #2563eb;
            color: #ffffff !important;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            transition: background-color 0.3s ease;
          }

          .security-note {
            font-size: 13px;
            color: #94a3b8;
            text-align: center;
            padding: 0 20px;
            margin-top: 30px;
          }

          .warning-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }

          .warning-text {
            margin: 0;
            color: #92400e;
            font-size: 14px;
          }

          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }

          .footer-text {
            font-size: 12px;
            color: #94a3b8;
            margin: 5px 0;
          }

          @media only screen and (max-width: 480px) {
            .content { padding: 30px 20px; }
            .greeting { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="container">
            <div class="header">
              <div class="logo-text">${this.COMPANY_NAME}</div>
            </div>

            <div class="content">
              <h1 class="greeting">Hola ${name},</h1>
              <p class="intro-text">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
                Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.
              </p>

              <div class="cta-container">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>

              <div class="warning-box">
                <p class="warning-text">
                  <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad. 
                  Si no solicitaste este cambio, ignora este correo.
                </p>
              </div>

              <p class="security-note">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>

            <div class="footer">
              <p class="footer-text"><strong>${this.COMPANY_NAME}</strong> • Soluciones Logísticas Inteligentes</p>
              <p class="footer-text">© ${new Date().getFullYear()} Todos los derechos reservados.</p>
              <p class="footer-text" style="margin-top: 15px; font-style: italic;">
                Este es un mensaje automático, por favor no responda a esta dirección de correo.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido de texto plano del correo de reset de contraseña
   */
  private static generatePasswordResetEmailText(data: {
    name: string;
    resetUrl: string;
  }): string {
    const { name, resetUrl } = data;

    return `
🔐 Restablecer Contraseña - ${this.COMPANY_NAME}

Hola ${name},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.

═══════════════════════════════════════════════════════════════

Para restablecer tu contraseña, visita el siguiente enlace:

${resetUrl}

═══════════════════════════════════════════════════════════════

⚠️  IMPORTANTE: 
    - Este enlace expirará en 1 hora por seguridad
    - Si no solicitaste este cambio, ignora este correo
    - No compartas este enlace con nadie

═══════════════════════════════════════════════════════════════

Este es un correo automático del sistema ${this.COMPANY_NAME}. 
Por favor, no respondas a este mensaje.

© ${new Date().getFullYear()} ${this.COMPANY_NAME}. 
Todos los derechos reservados.
    `.trim();
  }

  /**
   * Verifica si SendGrid está configurado correctamente
   */
  static isConfigured(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }
}
