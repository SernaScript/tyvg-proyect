#!/usr/bin/env tsx

import { execSync } from 'child_process';

async function installPlaywrightSimple() {
  try {
    console.log('🚀 Instalando Playwright de forma simple...');
    
    // Solo intentar instalar los navegadores sin dependencias del sistema
    console.log('🌐 Instalando navegadores de Playwright...');
    
    execSync('npx playwright install chromium', {
      stdio: 'inherit',
      timeout: 300000, // 5 minutos
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
        PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
        PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true',
        PLAYWRIGHT_SKIP_DEPENDENCY_INSTALLATION: 'true'
      }
    });

    console.log('✅ Playwright instalado correctamente');
  } catch (error) {
    console.warn('⚠️ No se pudo instalar Playwright:', error);
    console.log('ℹ️ El build continuará sin Playwright...');
    // No hacer exit(1) para que el build continúe
  }
}

installPlaywrightSimple();
