#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function installPlaywrightDeps() {
  try {
    console.log('🚀 Instalando Playwright para Vercel...');
    
    // Para Vercel, vamos a usar una estrategia diferente
    // Solo instalar los navegadores sin dependencias del sistema
    console.log('🌐 Instalando navegadores de Playwright (sin dependencias del sistema)...');
    
    try {
      execSync('npx playwright install chromium', {
        stdio: 'inherit',
        timeout: 300000,
        env: {
          ...process.env,
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
          PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true',
          PLAYWRIGHT_SKIP_DEPENDENCY_INSTALLATION: 'true'
        }
      });
      console.log('✅ Navegadores de Playwright instalados');
    } catch (error) {
      console.warn('⚠️ No se pudieron instalar los navegadores con dependencias:', error);
      
      // Intentar sin dependencias del sistema
      console.log('🔄 Intentando instalación sin dependencias del sistema...');
      try {
        execSync('npx playwright install chromium --force', {
          stdio: 'inherit',
          timeout: 300000,
          env: {
            ...process.env,
            PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
            PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
            PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true',
            PLAYWRIGHT_SKIP_DEPENDENCY_INSTALLATION: 'true'
          }
        });
        console.log('✅ Navegadores instalados sin dependencias del sistema');
      } catch (forceError) {
        console.warn('⚠️ Instalación forzada falló:', forceError);
        console.log('ℹ️ Continuando sin instalación de navegadores...');
      }
    }

    console.log('✅ Proceso de instalación de Playwright completado');
  } catch (error) {
    console.error('❌ Error en la instalación de Playwright:', error);
    // No hacer exit(1) para que el build continúe
    console.log('ℹ️ Continuando con el build sin Playwright...');
  }
}

installPlaywrightDeps();
