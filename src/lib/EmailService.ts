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
  private static readonly COMPANY_NAME = 'TYVG';

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
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
          }
          .container {
            background-color: white;
            padding: 0;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            color: white;
            text-align: center;
            padding: 40px 30px;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="truck" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M2 8h12v6H2z" fill="rgba(255,255,255,0.1)"/><circle cx="4" cy="14" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="12" cy="14" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="20" fill="url(%23truck)"/></svg>');
            opacity: 0.3;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
          }
          .truck-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            position: relative;
            z-index: 1;
          }
          .content {
            padding: 40px 30px;
          }
          .welcome-text {
            font-size: 18px;
            color: #374151;
            margin-bottom: 30px;
          }
          .credentials-box {
            background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%);
            border: 2px solid #ea580c;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            position: relative;
          }
          .credentials-box::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, #ea580c, #f97316);
            border-radius: 12px;
            z-index: -1;
          }
          .credentials-title {
            margin: 0 0 20px 0;
            color: #ea580c;
            font-size: 20px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .credential-item {
            margin: 15px 0;
            padding: 15px;
            background-color: white;
            border-radius: 8px;
            border-left: 4px solid #ea580c;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .label {
            font-weight: bold;
            color: #374151;
            display: inline-block;
            width: 120px;
            font-size: 14px;
          }
          .value {
            color: #1f2937;
            font-family: 'Courier New', monospace;
            background-color: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            border: 1px solid #e5e7eb;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(234, 88, 12, 0.4);
          }
          .footer {
            margin-top: 40px;
            padding: 25px 30px;
            background-color: #f8fafc;
            border-top: 3px solid #ea580c;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            color: #92400e;
            position: relative;
          }
          .warning::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            width: 20px;
            height: 20px;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2392400e"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/></svg>');
            background-size: contain;
            background-repeat: no-repeat;
          }
          .warning-text {
            margin-left: 35px;
          }
          .truck-decoration {
            text-align: center;
            margin: 20px 0;
            opacity: 0.1;
          }
          .section-icon {
            width: 24px;
            height: 24px;
            vertical-align: middle;
            margin-right: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="truck-icon">
              <svg viewBox="0 0 100 100" fill="white">
                <path d="M20 30h50v30H20z" fill="white"/>
                <path d="M70 35h15v20H70z" fill="white"/>
                <circle cx="30" cy="70" r="8" fill="white"/>
                <circle cx="70" cy="70" r="8" fill="white"/>
                <path d="M25 30v-5c0-5 5-10 10-10h20c5 0 10 5 10 10v5" fill="white"/>
                <rect x="35" y="25" width="20" height="10" fill="rgba(0,0,0,0.1)"/>
              </svg>
            </div>
            <div class="logo">${this.COMPANY_NAME}</div>
            <h1 style="margin: 0; font-size: 24px;">¡Bienvenido al Sistema!</h1>
          </div>

          <div class="content">
            <p class="welcome-text">Hola <strong>${name}</strong>,</p>
            
            <p>Tu cuenta ha sido creada exitosamente en el sistema de gestión logística de ${this.COMPANY_NAME}. A continuación encontrarás tus datos de acceso para comenzar a trabajar:</p>

            <div class="credentials-box">
              <h3 class="credentials-title">
                <svg class="section-icon" viewBox="0 0 24 24" fill="#ea580c">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Datos de Acceso
              </h3>
              
              <div class="credential-item">
                <span class="label">Email:</span>
                <span class="value">${email}</span>
              </div>
              
              <div class="credential-item">
                <span class="label">Contraseña:</span>
                <span class="value">${password}</span>
              </div>
              
              <div class="credential-item">
                <span class="label">Rol:</span>
                <span class="value">${roleName}</span>
              </div>
            </div>

            <div class="warning">
              <div class="warning-text">
                <strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Acceder al Sistema</a>
            </div>

            <div class="truck-decoration">
              <svg viewBox="0 0 200 50" fill="#ea580c" opacity="0.1">
                <path d="M20 20h80v20H20z"/>
                <path d="M100 25h30v10H100z"/>
                <circle cx="40" cy="50" r="8"/>
                <circle cx="120" cy="50" r="8"/>
                <path d="M25 20v-5c0-5 5-10 10-10h30c5 0 10 5 10 10v5"/>
                <rect x="50" y="15" width="30" height="10"/>
              </svg>
            </div>

            <p>Si tienes alguna pregunta o necesitas ayuda con el sistema, no dudes en contactar al administrador del sistema.</p>
          </div>

          <div class="footer">
            <p>Este es un correo automático del sistema ${this.COMPANY_NAME}. Por favor, no respondas a este mensaje.</p>
            <p>© ${new Date().getFullYear()} ${this.COMPANY_NAME}. Todos los derechos reservados.</p>
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
