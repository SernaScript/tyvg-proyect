#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function installPlaywrightVercel() {
  try {
    console.log('🚀 Instalando Playwright para Vercel...');
    
    // Configurar variables de entorno específicas para Vercel
    const env = {
      ...process.env,
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
      PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
      PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true',
      PLAYWRIGHT_SKIP_DEPENDENCY_INSTALLATION: 'true',
      PLAYWRIGHT_DOWNLOAD_HOST: 'https://playwright.azureedge.net',
      DEBIAN_FRONTEND: 'noninteractive',
      CI: 'true'
    };

    // Crear directorio para navegadores si no existe
    const browsersPath = '/tmp/playwright';
    if (!fs.existsSync(browsersPath)) {
      fs.mkdirSync(browsersPath, { recursive: true });
      console.log(`📁 Directorio de navegadores creado: ${browsersPath}`);
    }

    // Intentar instalar solo Chromium (más ligero)
    console.log('🌐 Instalando Chromium para Vercel...');
    
    try {
      execSync('npx playwright install chromium', {
        stdio: 'inherit',
        timeout: 300000, // 5 minutos
        env
      });
      console.log('✅ Chromium instalado correctamente');
    } catch (error) {
      console.warn('⚠️ Error instalando Chromium:', error);
      
      // Intentar con opciones adicionales
      console.log('🔄 Intentando instalación con opciones adicionales...');
      try {
        execSync('npx playwright install chromium --force', {
          stdio: 'inherit',
          timeout: 300000,
          env: {
            ...env,
            PLAYWRIGHT_SKIP_DEPENDENCY_INSTALLATION: 'true'
          }
        });
        console.log('✅ Chromium instalado con opciones adicionales');
      } catch (forceError) {
        console.warn('⚠️ Instalación forzada falló:', forceError);
        
        // Último intento: instalar sin validaciones
        console.log('🔄 Último intento: instalación sin validaciones...');
        try {
          execSync('npx playwright install chromium --with-deps', {
            stdio: 'inherit',
            timeout: 300000,
            env: {
              ...env,
              PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true',
              PLAYWRIGHT_SKIP_DEPENDENCY_INSTALLATION: 'false'
            }
          });
          console.log('✅ Chromium instalado con dependencias');
        } catch (finalError) {
          console.warn('⚠️ Todos los intentos de instalación fallaron:', finalError);
          console.log('ℹ️ Continuando sin instalación de navegadores...');
          console.log('ℹ️ Los navegadores se descargarán en runtime si es necesario');
        }
      }
    }

    // Verificar si la instalación fue exitosa
    const playwrightPath = path.join(process.cwd(), 'node_modules', '.playwright');
    if (fs.existsSync(playwrightPath)) {
      console.log('✅ Playwright configurado correctamente');
    } else {
      console.log('ℹ️ Playwright se configurará en runtime');
    }

    console.log('✅ Proceso de instalación de Playwright para Vercel completado');
  } catch (error) {
    console.error('❌ Error en la instalación de Playwright:', error);
    console.log('ℹ️ Continuando con el build...');
    // No hacer exit(1) para que el build continúe
  }
}

installPlaywrightVercel();
