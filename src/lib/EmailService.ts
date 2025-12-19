import sgMail from '@sendgrid/mail';

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface UserActivationEmailData {
  email: string;
  name: string | null;
  password: string;
  roleName: string;
  loginUrl: string;
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

      const { email, name, password, roleName, loginUrl } = data;

      const htmlContent = this.generateActivationEmailHTML({
        name: name || 'Usuario',
        email,
        password,
        roleName,
        loginUrl
      });

      const textContent = this.generateActivationEmailText({
        name: name || 'Usuario',
        email,
        password,
        roleName,
        loginUrl
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
    password: string;
    roleName: string;
    loginUrl: string;
  }): string {
    const { name, email, password, roleName, loginUrl } = data;

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
                  <span class="label">Contraseña temporal</span>
                  <span class="value">${password}</span>
                </div>
                <div class="credential-row">
                  <span class="label">Perfil asignado</span>
                  <span class="role-badge">${roleName}</span>
                </div>
              </div>

              <div class="cta-container">
                <a href="${loginUrl}" class="button">Iniciar sesión en la consola</a>
              </div>

              <p class="security-note">
                Por motivos de seguridad, el sistema le solicitará actualizar su contraseña tras el primer ingreso. 
                Si tiene alguna dificultad técnica, nuestro equipo de soporte está a su disposición.
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
    password: string;
    roleName: string;
    loginUrl: string;
  }): string {
    const { name, email, password, roleName, loginUrl } = data;

    return `
🚛 ¡Bienvenido a ${this.COMPANY_NAME}! 🚛

Hola ${name},

Tu cuenta ha sido creada exitosamente en el sistema de gestión logística de ${this.COMPANY_NAME}. 

═══════════════════════════════════════════════════════════════
                    DATOS DE ACCESO AL SISTEMA
═══════════════════════════════════════════════════════════════

📧 Email: ${email}
🔑 Contraseña: ${password}
👤 Rol: ${roleName}

═══════════════════════════════════════════════════════════════

⚠️  IMPORTANTE: Por seguridad, te recomendamos cambiar tu 
    contraseña después del primer inicio de sesión.

🌐 Para acceder al sistema, visita: ${loginUrl}

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
   * Verifica si SendGrid está configurado correctamente
   */
  static isConfigured(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }
}
